import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGeoLocation } from "./Hooks/useGeoLocation";

const { kakao } = window;

function App() {
  const [place, setPlace] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [map, setMap] = useState(null);
  const container = useRef(null);

  const geolocationOptions = useMemo(
    () => ({
      enableHighAccuracy: true,
      timeout: 1000 * 20, // 20초로 늘림
      maximumAge: 1000 * 3600 * 24, // 위치 캐시 시간 24시간
    }),
    []
  );

  const [location, error, loading, retryLocation] =
    useGeoLocation(geolocationOptions);

  useEffect(() => {
    const fallbackPosition = new kakao.maps.LatLng(37.5665, 126.978); // 서울 시청

    const options = {
      center: fallbackPosition,
      level: 6,
    };
    const mapInstance = new kakao.maps.Map(container.current, options);
    setMap(mapInstance);

    const control = new kakao.maps.ZoomControl();
    mapInstance.addControl(control, kakao.maps.ControlPosition.BOTTOMRIGHT);
  }, []);

  useEffect(() => {
    if (!location || !map) return;
    const position = new kakao.maps.LatLng(
      location.latitude,
      location.longitude
    );
    map.panTo(position);

    const marker = new kakao.maps.Marker({ position });
    marker.setMap(map);
  }, [location, map]);

  function searchPlaces() {
    fetch(`https://dapi.kakao.com/v2/local/search/keyword?query=${place}`, {
      headers: {
        Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.documents);
      });
  }

  return (
    <div className="App">
      {loading && <p>위치 정보를 불러오는 중입니다...</p>}
      {error && !loading && (
        <div style={{ color: "red" }}>
          <p>에러: {error}</p>
          <button onClick={retryLocation}>위치 재시도</button>
        </div>
      )}
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
        />
        <button onClick={searchPlaces}>검색</button>
      </div>
      <div>
        {searchResults.map((item, index) => (
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
