document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTS ---
  const body = document.body;
  const coverOverlay = document.getElementById('coverOverlay');
  const btnBuka = document.getElementById('btnBuka');
  const audio = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const toast = document.getElementById('toast');
  const copyBtn = document.getElementById('btnCopy');
  const formUcapan = document.getElementById('formUcapan');
  const ucapanFeed = document.getElementById('ucapanFeed');

  // ============================================================
  //  GOOGLE SHEETS INTEGRATION
  //  Paste URL Web App dari Google Apps Script di bawah ini:
  // ============================================================
  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbz6cWVjraWKTkWnnE3s595JNzT4jwyKQcf809mXUGVtqW_9WZjBKgZ-MzeTzrRWeFca/exec";

  // --- KIRIM UCAPAN KE GOOGLE SHEETS ---
  function kirimKeSheets(data) {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === "PASTE_URL_APPS_SCRIPT_DI_SINI") return;
    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(err => console.log("Gagal kirim ke Sheets:", err));
  }
  
  // Simulator elements
  const btnIphone = document.getElementById('btnIphone');
  const btnAndroid = document.getElementById('btnAndroid');
  const phoneShell = document.getElementById('phoneShell');
  const phoneScreen = document.getElementById('phoneScreen');

  // --- AUDIO LOGIC ---
  let isPlaying = false;

  function playAudio() {
    audio.play()
      .then(() => {
        isPlaying = true;
        musicToggle.classList.add('playing');
      })
      .catch((err) => {
        console.log("Autoplay blocked or audio load error:", err);
      });
  }

  function toggleAudio() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      musicToggle.classList.remove('playing');
    } else {
      audio.play()
        .then(() => {
          isPlaying = true;
          musicToggle.classList.add('playing');
        })
        .catch(err => console.log(err));
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', toggleAudio);
  }

  // --- BUKA UNDANGAN (COVER DISMISS) ---
  // Lock scroll initially
  body.classList.add('locked');
  if (phoneScreen) {
    phoneScreen.style.overflowY = 'hidden';
  }

  if (btnBuka) {
    btnBuka.addEventListener('click', () => {
      // Unlock scrolling
      body.classList.remove('locked');
      if (phoneScreen) {
        phoneScreen.style.overflowY = 'auto';
      }
      
      // Dismiss cover overlay
      if (coverOverlay) {
        coverOverlay.classList.add('dismissed');
      }

      // Start music
      playAudio();

      // Trigger scroll animations for visible parts after cover slides up
      setTimeout(triggerAnimations, 1000);
    });
  }

  // --- COUNTDOWN TIMER ---
  // Target date: 03 July 2026 at 14:00:00 (Asia/Makassar or local time)
  const targetDate = new Date('July 3, 2026 14:00:00').getTime();
  let isCountdownCountUpActive = false;
  let countUpTimeouts = [];

  function updateCountdown() {
    if (isCountdownCountUpActive) return;

    const now = new Date().getTime();
    const difference = targetDate - now;

    const daysVal = document.getElementById('days');
    const hoursVal = document.getElementById('hours');
    const minutesVal = document.getElementById('minutes');
    const secondsVal = document.getElementById('seconds');

    if (!daysVal || !hoursVal || !minutesVal || !secondsVal) return;

    if (difference <= 0) {
      daysVal.innerText = '00';
      hoursVal.innerText = '00';
      minutesVal.innerText = '00';
      secondsVal.innerText = '00';
      return;
    }

    // Time calculations
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Format with leading zero
    daysVal.innerText = days < 10 ? '0' + days : days;
    hoursVal.innerText = hours < 10 ? '0' + hours : hours;
    minutesVal.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsVal.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  // Value animation helper (count up from start to end)
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      obj.innerText = currentValue < 10 ? '0' + currentValue : currentValue;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Trigger rolling count-up sequentially
  function triggerCountdownCountUp() {
    countUpTimeouts.forEach(clearTimeout);
    countUpTimeouts = [];

    const now = new Date().getTime();
    const difference = targetDate - now;
    if (difference <= 0) return;

    const targetDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    const targetHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const targetMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const targetSeconds = Math.floor((difference % (1000 * 60)) / 1000);

    const elements = [
      { id: 'days', target: targetDays, delay: 2100 },
      { id: 'hours', target: targetHours, delay: 2300 },
      { id: 'minutes', target: targetMinutes, delay: 2500 },
      { id: 'seconds', target: targetSeconds, delay: 2700 }
    ];

    isCountdownCountUpActive = true;

    elements.forEach(el => {
      const domEl = document.getElementById(el.id);
      if (!domEl) return;
      domEl.innerText = "00"; // Reset to zero initially

      const timeoutId = setTimeout(() => {
        animateValue(domEl, 0, el.target, 1000);
      }, el.delay);
      countUpTimeouts.push(timeoutId);
    });

    if (window.countUpActiveTimeout) clearTimeout(window.countUpActiveTimeout);
    window.countUpActiveTimeout = setTimeout(() => {
      isCountdownCountUpActive = false;
      updateCountdown();
    }, 3800);
  }

  // Run countdown immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);


  // --- SCROLL ANIMATIONS (INTERSECTION OBSERVER) ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        if (entry.target.closest('#welcome')) {
          triggerCountdownCountUp();
        }
      } else {
        entry.target.classList.remove('reveal-active');
      }
    });
  }, {
    root: phoneScreen,
    threshold: 0.2, // Lenient threshold to trigger as snap begins
    rootMargin: '0px'
  });

  function triggerAnimations() {
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }


  // --- COPY TO CLIPBOARD ---
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const accNum = "522601022086534";
      navigator.clipboard.writeText(accNum)
        .then(() => {
          showToast("Nomor Rekening Berhasil Disalin!");
        })
        .catch(err => {
          console.error("Failed to copy text: ", err);
          // Fallback method
          const tempInput = document.createElement("input");
          tempInput.value = accNum;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
          showToast("Nomor Rekening Berhasil Disalin!");
        });
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }


  // --- KIRIM UCAPAN (GUESTBOOK) ---
  // Beautiful pre-populated wishes
  const defaultWishes = [
    {
      id: 1,
      name: "Kel. Bapak Ahmad",
      status: "hadir",
      message: "Selamat menempuh hidup baru Amyrah & Jahrul! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Dilancarkan sampai hari H pernikahan yaa.",
      time: "1 jam yang lalu"
    },
    {
      id: 2,
      name: "Rian & Shinta",
      status: "hadir",
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Selamat ya bro Jahrul dan istri! Semoga bahagia selamanya.",
      time: "4 jam yang lalu"
    },
    {
      id: 3,
      name: "Indah Fitriani",
      status: "ragu",
      message: "Selamat berbahagia ya Amyrah sayang! Maaf belum bisa mastiin hadir langsung karena berbenturan tugas kerja, tapi doa terbaik selalu mengiringi kalian.",
      time: "Yesterday"
    }
  ];

  // Load from local storage or set defaults
  let wishes = JSON.parse(localStorage.getItem('wedding_wishes'));
  if (!wishes || wishes.length === 0) {
    wishes = defaultWishes;
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }

  function getBadgeClass(status) {
    switch(status) {
      case 'hadir': return 'badge-hadir';
      case 'tidak-hadir': return 'badge-tidak-hadir';
      default: return 'badge-ragu';
    }
  }

  function getStatusLabel(status) {
    switch(status) {
      case 'hadir': return 'âœ“ Hadir';
      case 'tidak-hadir': return 'âœ• Absen';
      default: return '? Ragu-ragu';
    }
  }

  function renderWishes() {
    if (!ucapanFeed) return;
    
    if (wishes.length === 0) {
      ucapanFeed.innerHTML = '<div class="empty-feed">Belum ada ucapan. Jadilah yang pertama memberikan doa restu!</div>';
      return;
    }

    ucapanFeed.innerHTML = '';
    
    // Render from newest to oldest
    const sortedWishes = [...wishes].sort((a, b) => b.id - a.id);

    sortedWishes.forEach(wish => {
      // Generate initials for avatar
      const nameParts = wish.name.split(' ');
      const initials = nameParts.length > 1 
        ? (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase() 
        : nameParts[0].charAt(0).toUpperCase();

      const item = document.createElement('div');
      item.className = 'ucapan-item';
      item.innerHTML = `
        <div class="ucapan-avatar">${initials}</div>
        <div class="ucapan-bubble">
          <div class="ucapan-meta">
            <span class="ucapan-sender">${escapeHTML(wish.name)}</span>
            <span class="ucapan-badge ${getBadgeClass(wish.status)}">${getStatusLabel(wish.status)}</span>
          </div>
          <p class="ucapan-text">${escapeHTML(wish.message)}</p>
          <span class="ucapan-time">${wish.time}</span>
        </div>
      `;
      ucapanFeed.appendChild(item);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Handle Form Submission
  if (formUcapan) {
    formUcapan.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputNama = document.getElementById('nama');
      const selectStatus = document.getElementById('status');
      const txtUcapan = document.getElementById('ucapan');

      if (!inputNama.value.trim() || !txtUcapan.value.trim()) {
        showToast("Harap isi nama dan ucapan Anda!");
        return;
      }

      const newWish = {
        id: Date.now(),
        name: inputNama.value.trim(),
        status: selectStatus.value,
        message: txtUcapan.value.trim(),
        time: "Baru saja"
      };

      // Simpan ke localStorage (tampil di undangan)
      wishes.push(newWish);
      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

      // Kirim ke Google Sheets (database)
      kirimKeSheets({
        name: newWish.name,
        status: newWish.status,
        message: newWish.message
      });

      renderWishes();
      showToast("Ucapan berhasil dikirim! 💌");

      // Reset form
      formUcapan.reset();

      // Smooth scroll to top of ucapan feed
      ucapanFeed.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- SIMULATOR CONTROLS ---
  if (btnIphone && btnAndroid && phoneShell) {
    btnIphone.addEventListener('click', () => {
      phoneShell.classList.remove('android-mode');
      phoneShell.classList.add('iphone-mode');
      btnIphone.classList.add('active');
      btnAndroid.classList.remove('active');
    });

    btnAndroid.addEventListener('click', () => {
      phoneShell.classList.remove('iphone-mode');
      phoneShell.classList.add('android-mode');
      btnAndroid.classList.add('active');
      btnIphone.classList.remove('active');
    });
  }

  // Initial render
  renderWishes();
});

