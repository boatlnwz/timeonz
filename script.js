const LOCATIONS = {
    'bangkok': { lat: 13.7563, long: 100.5018, nameTH: 'กรุงเทพมหานคร' },
    'salaya': { lat: 13.8016, long: 100.3228, nameTH: 'ศาลายา' },
    'phetchaburi': { lat: 13.1069, long: 99.9450, nameTH: 'เพชรบุรี' }
};

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('clock-h').innerText = h;
    document.getElementById('clock-m').innerText = m;
    document.getElementById('clock-s').innerText = s;

    const thaiYear = now.getFullYear() + 543;
    let dateStr = now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
    dateStr += ` ${thaiYear}`;
    document.getElementById('date-th').innerText = dateStr;

    updateLighting(now);
}

function updateLighting(dateObj) {
    const totalMinutes = (dateObj.getHours() * 60) + dateObj.getMinutes();
    
    const darkStartLate = 23 * 60; 
    const darkEndEarly = 4 * 60 + 30; 
    const dawnEnd = 6 * 60; 
    const duskStart = 18 * 60; 
    const duskEnd = 23 * 60; 

    let intensity = 0;
    let sunX = 50, sunY = 150;

    if (totalMinutes >= darkStartLate || totalMinutes < darkEndEarly) {
        intensity = 0;
        sunY = 150;
    } else if (totalMinutes >= darkEndEarly && totalMinutes < dawnEnd) {
        const range = dawnEnd - darkEndEarly; 
        const progress = (totalMinutes - darkEndEarly) / range;
        intensity = progress * 0.4; 
        sunX = 20 + (10 * progress);
        sunY = 120 - (20 * progress); 
    } else if (totalMinutes >= dawnEnd && totalMinutes < duskStart) {
        const range = duskStart - dawnEnd;
        const progress = (totalMinutes - dawnEnd) / range;
        intensity = 0.4 + (0.6 * Math.sin(progress * Math.PI)); 
        if (intensity > 1) intensity = 1;
        sunX = 30 + (40 * progress);
        sunY = 100 - (80 * Math.sin(progress * Math.PI)); 
    } else if (totalMinutes >= duskStart && totalMinutes < duskEnd) {
        const range = duskEnd - duskStart; 
        const progress = (totalMinutes - duskStart) / range;
        intensity = (1 - progress) * 0.3; 
        sunX = 70 + (10 * progress);
        sunY = 100 + (50 * progress); 
    }

    const root = document.documentElement;
    root.style.setProperty('--day-intensity', intensity);
    root.style.setProperty('--sun-position-x', `${sunX}%`);
    root.style.setProperty('--sun-position-y', `${sunY}%`);
}

function getWeatherIcon(code) {
    if (code === 0) return { icon: '☀', desc: 'ท้องฟ้าแจ่มใส' };
    if (code >= 1 && code <= 3) return { icon: '☁', desc: 'มีเมฆเป็นบางส่วน' };
    if (code >= 45 && code <= 48) return { icon: '🌫', desc: 'มีหมอก' };
    if (code >= 51 && code <= 67) return { icon: '☂', desc: 'ฝนตกปรอยๆ' };
    if (code >= 80 && code <= 82) return { icon: '☂', desc: 'ฝนตกหนัก' };
    if (code >= 95) return { icon: '⛈', desc: 'พายุฝนฟ้าคะนอง' };
    return { icon: '☁', desc: 'มีเมฆมาก' };
}

async function fetchWeather(locationKey) {
    const loc = LOCATIONS[locationKey];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.long}&current_weather=true`;

    document.getElementById('w-temp').classList.add('loading');
    document.getElementById('w-icon').classList.add('loading');
    document.getElementById('w-desc').innerText = `กำลังดึงข้อมูล ${loc.nameTH}...`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        const windSpeed = data.current_weather.windspeed;
        const weatherInfo = getWeatherIcon(weatherCode);

        document.getElementById('w-temp').innerText = `${temp}°C`;
        document.getElementById('w-icon').innerText = weatherInfo.icon;
        document.getElementById('w-desc').innerText = `${weatherInfo.desc} • ลม ${windSpeed} กม./ชม.`;
        
        document.getElementById('w-temp').classList.remove('loading');
        document.getElementById('w-icon').classList.remove('loading');

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('w-desc').innerText = "โหลดข้อมูลไม่สำเร็จ";
    }
}

function changeLocation() {
    const selectBox = document.getElementById('location-select');
    fetchWeather(selectBox.value);
}

setInterval(updateClock, 1000);
updateClock();
fetchWeather('bangkok');