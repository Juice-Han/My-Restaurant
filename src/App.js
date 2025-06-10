import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGeoLocation } from "./Hooks/useGeoLocation";

const { kakao } = window; // 전역 kakao 객체를 가져옴

function App() {
  const [place, setPlace] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [map, setMap] = useState(null);
  const container = useRef(null); // 지도를 표시할 div를 참조 객체

  // location으로 인해 발생하는 무한 리렌더링을 방지하기 위한 메모이제이션
  const geolocationOptions = useMemo(() => ({
    enableHighAccuracy: true,
    timeout: 1000 * 10,
    maximumAge: 1000 * 3600 * 24,
  }), [])

  useEffect(() => {
    console.log('App useEffect called');
    const position = new kakao.maps.LatLng(37.56941908443059, 126.97873075439414); // 초기 위치 설정
    const options = {
      center: position, // 지도의 중심 좌표
      level: 6, // 지도 확대 레벨
    };
    const mapInstance = new kakao.maps.Map(container.current, options);
    setMap(mapInstance); // map 상태를 업데이트
    
    const control = new kakao.maps.ZoomControl();
    mapInstance.addControl(control, kakao.maps.ControlPosition.BOTTOMRIGHT);
  }, []);

  const [ location, error ] = useGeoLocation(geolocationOptions);

  function searchPlaces() {
    fetch(`https://dapi.kakao.com/v2/local/search/keyword?query=${place}`, {
      headers: {
        Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`, // 환경 변수에서 API 키를 가져옵니다.
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.documents);
      });
  }

  useEffect(() => {
    if (!location || !map) return;
    const position = new kakao.maps.LatLng(
      location.latitude,
      location.longitude
    );
    map.panTo(position);
  }, [location, map]);

  return (
    <div className="App">
      {error && <div>에러: {error}</div>}
      {!error && location && (
        <div>
          <p>
            현재 위치 = x: {location.latitude}, y: {location.longitude}
          </p>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div style={{ width: "500px", height: "400px" }} ref={container}></div>
      </div>
      <div>
        <input
          type="text"
          value={place}
          placeholder="장소를 입력하세요"
          onChange={(e) => setPlace(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
        ></input>
        <button onClick={searchPlaces}>검색</button>
      </div>
      <div>
        {searchResults &&
          searchResults.map((item, index) => (
            <div key={index}>
              <h3>지역명: {item.address_name}</h3>
              <p>도로명: {item.road_address_name || "X"}</p>
              <p>장소이름: {item.place_name}</p>
              <p>
                좌표값: {item.x}, {item.y}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
