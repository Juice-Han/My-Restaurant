import './App.css';
import {useEffect, useRef, useState } from 'react';
const { kakao } = window; // 전역 kakao 객체를 가져옵니다.
function App() {
  const [place, setPlace] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const container = useRef(null); // 지도를 표시할 div를 참조하기 위한 useRef 훅을 사용합니다.
  useEffect(() => {
    const position = new kakao.maps.LatLng(33.450701, 126.570667);
    const options = {
      center: position, // 지도의 중심 좌표
      level: 3, // 지도 확대 레벨
    };
    const map = new kakao.maps.Map(container.current, options);
    const control = new kakao.maps.ZoomControl();
    map.addControl(control, kakao.maps.ControlPosition.BOTTOMRIGHT)
  }, []);

  function searchPlaces() {
    fetch(`https://dapi.kakao.com/v2/local/search/keyword?query=${place}`, {
      headers: {
        Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}` // 환경 변수에서 API 키를 가져옵니다.
      }
    }).then(res => res.json())
      .then(data => {
        console.log(data)
        setSearchResults(data.documents)
      })
  }

  return (
    <div className="App">
      <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
        <div style={{ width: "500px", height: "400px" }} ref={container}></div>  
      </div>
      <div>
        <input type='text' value={place} placeholder='장소를 입력하세요' onChange={e => setPlace(e.target.value)}></input>
        <button onClick={searchPlaces}>검색</button>
      </div>
      <div>
        {searchResults && searchResults.map((item, index) => (
          <div key={index}>
            <h3>지역명: {item.address_name}</h3>
            <p>도로명: {item.road_address_name || "X"}</p>
            <p>좌표값: {item.x}, {item.y}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
