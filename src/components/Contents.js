import {useState, useEffect} from 'react'
// useState를 통해서 배열 관리
// useEffect를 통해서 패치api를 사용
import { Bar, Doughnut, Line } from 'react-chartjs-2' 
import axios from 'axios'
import { act } from 'react-dom/test-utils'

const Contents = () => {
             // 데이터명, 메서드                            
    const [confirmedData, setConfirmedData] = useState({}) //확진자  
    const [quarantinedData, setQuarantinedData] = useState({}) // 격리자 
    const [comparedData, setComparedData] = useState({})  // 현재 달 

    useEffect(()=>{
        const fetchEvents = async () => {
            const res = await axios.get("https://api.covid19api.com/total/dayone/country/kr")
            // console.log(res);
            makeData(res.data) 
        } 

        const makeData = (items)=>{
            // items.forEach(item => console.log(item))
            const arr = items.reduce((acc, cur)=>{
            // 포이치 대신 리듀스로   (쌓여서 다음 반복문으로 넘어가는 전달값, 현재 반복문이 돌고 있는 아이템 값)

            const currentDate = new Date(cur.Date);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const date = currentDate.getDate();
            // console.log(cur, year,mouth,date )
            const confirmed = cur.Confirmed;
            const active = cur.Active;
            const death = cur.Deaths;
            const recovered = cur.Recovered;

            //if 년월 값에 acc에 안들어잇으면 푸쉬(저장) 
            //else 날짜를 비교해서 큰날짜것만 저장
            // ↓

            const findItem = acc.find(a => a.year === year && a.month === month);

            if(!findItem){ // year : year 같으면 year로 축약 가능 
                // acc.push({ year : year, month : month, date:date});
                acc.push({ year, month, date, confirmed, active, death, recovered});
            }
            if(findItem && findItem.date < date){
                findItem.active = active;
                findItem.death = death;
                findItem.year =year;
                findItem.month =month;
                findItem.date= date;
                findItem.confirmed =confirmed;
                findItem.recovered= recovered;
            }
            return acc;

        },[])

            // console.log(arr)

            const labels = arr.map(a => `${a.month+1}월`)

            setConfirmedData({
                labels,
                datasets: [
                    {
                        label: "국내 누적 확진자",
                        backgroundColor: "salmon",
                        fill: true,
                        data: arr.map(a=> a.confirmed)
                    },
                ]
            
            });
            setQuarantinedData({
                labels,
                datasets: [
                    {
                        label: "월별 격리자 현황",
                        borderColor: "salmon",
                        fill: false,
                        data: arr.map(a=> a.active)
                    },
                ]
            
            });

            const lastMonth = arr[arr.length -1] // 마지막 달 가져오기
            console.log(lastMonth);
            setComparedData({
                labels: ["확진자","격리해제","사망"],
                datasets: [
                    {
                        label: "누적 확진, 해제, 사망 비율",
                        backgroundColor: ["#ff3d67","#059bff","#ffc233"],
                        borderColor: ["#ff3d67","#059bff","#ffc233"],
                        fill: false,
                        data: [lastMonth.confirmed, lastMonth.recovered, lastMonth.death]
                    },
                ]
            
            });

        }
        fetchEvents()
    },[])
    return (
        <section>
            <h1>국내 코로나 현황</h1>
            <div className="contents">
                <div>
                    <Bar data={confirmedData} options={
                        { title:{ display: true}, text : "누적 확진자 추이", fontSize: 16},
                        {legend: {display: true, position: "bottom"} }
                        // legend는 그래프가 어떤걸 뜻하는지 알려주는..
                    }></Bar>
                </div>

                <div>
                    <Line data={quarantinedData} options={
                        { title:{ display: true}, text : "월별 격리자 현황", fontSize: 16},
                        {legend: {display: true, position: "bottom"} }
                        // legend는 그래프가 어떤걸 뜻하는지 알려주는..
                    }></Line>
                </div>

                <div>
                    <Doughnut data={comparedData} options={
                        { title:{ display: true}, text : `누적, 확지, 해제, 사망(${new Date().getMonth()+1}월)현황`, fontSize: 16},
                        {legend: {display: true, position: "bottom"} }
                        // legend는 그래프가 어떤걸 뜻하는지 알려주는..
                    }></Doughnut>
                </div>
            </div>
        </section>
    )
}

export default Contents
