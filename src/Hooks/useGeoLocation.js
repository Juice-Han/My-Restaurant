import { useState, useEffect, useCallback } from 'react';

export const useGeoLocation = (options = {}) => {
  const [location, setLocation] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = (pos) => {
    const { latitude, longitude } = pos.coords;
    setLocation({ latitude, longitude });
    setError('');
    setLoading(false);
  };

  const handleError = (err) => {
    let message = "";
    switch (err.code) {
      case 1:
        message = "권한이 거부되었습니다. 위치 접근을 허용해 주세요.";
        break;
      case 2:
        message = "위치를 찾을 수 없습니다. 네트워크 또는 GPS 상태를 확인하세요.";
        break;
      case 3:
        message = "요청 시간이 초과되었습니다.";
        break;
      default:
        message = "알 수 없는 오류가 발생했습니다.";
    }
    setError(message);
    setLoading(false);
  };

  const requestLocation = useCallback(() => {
    const { geolocation } = navigator;
    if (!geolocation) {
      setError("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');  // 재시도 시점에 에러 초기화
    geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [options]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return [location, error, loading, requestLocation];
};
