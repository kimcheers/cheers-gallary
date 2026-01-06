function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
    if (id === 'gallery') loadGallery();
}

async function handleLogin() {
    const password = document.getElementById('admin-pw').value;
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (res.ok) {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('admin-controls').classList.remove('hidden');
        alert("관리자 인증 성공!");
    } else {
        alert("비밀번호가 틀렸습니다.");
    }
}

async function handleUpload() {
    const file = document.getElementById('file-input').files[0];
    if (!file) return alert("업로드할 파일을 선택해주세요.");

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/upload', { method: 'POST', body: formData });
    if (res.ok) {
        alert("성공적으로 업로드되었습니다!");
        showSection('gallery');
    } else {
        alert("업로드 권한이 없습니다. 먼저 로그인해주세요.");
    }
}

async function loadGallery() {
    const display = document.getElementById('image-display');
    display.innerHTML = "<p style='text-align:center;'>갤러리를 불러오는 중입니다...</p>";

    try {
        const res = await fetch('/images');
        const urls = await res.json();

        if (urls.length === 0) {
            display.innerHTML = "<p style='text-align:center;'>아직 업로드된 이미지가 없습니다.</p>";
        } else {
            // 이미지 클릭 시 원본을 새 창에서 열도록 onclick 추가
            display.innerHTML = urls.map(url => `
                <img src="${url}" alt="Gallery Image" onclick="window.open('${url}', '_blank')">
            `).join('');
        }
    } catch (e) {
        display.innerHTML = "<p style='color:red;'>데이터 로딩 에러: " + e.message + "</p>";
    }
}

window.onload = () => showSection('about');