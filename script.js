document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  initSite();
});

async function loadPartials() {
  const includeTargets = document.querySelectorAll("[data-include]");

  await Promise.all(
    Array.from(includeTargets).map(async (target) => {
      const file = target.getAttribute("data-include");

      try {
        const response = await fetch(file);

        if (!response.ok) {
          throw new Error(`Unable to load ${file}`);
        }

        target.outerHTML = await response.text();
      } catch (error) {
        target.innerHTML = `<p class="partial-error">Section could not be loaded. Run the site through the local server.</p>`;
        console.error(error);
      }
    })
  );
}

function initSite() {
  initMenu();
  initActiveNav();
  initChatbot();
  initTestimonialSlider();
  initCaseSlider();
  initLeadForm();
}

function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("navMenu");

  if (toggle && nav) {
    toggle.onclick = () => nav.classList.toggle("active");
  }
}

function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;

      if (pageYOffset >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");

      if (current && link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });
}

function initChatbot() {
  const body = document.getElementById("chatBody");
  const input = document.getElementById("chatInput");
  const chatToggle = document.getElementById("chatToggle");
  const chatBox = document.getElementById("chatBox");
  const chatClose = document.getElementById("chatClose");

  if (!body || !input || !chatToggle || !chatBox || !chatClose) {
    return;
  }

  let step = 0;
  let lead = {};
  let closeTimer;

  function botMessage(text) {
    const div = document.createElement("div");
    div.className = "bot-msg";
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function userMessage(text) {
    const div = document.createElement("div");
    div.className = "user-msg";
    div.innerText = text;
    body.appendChild(div);
  }

  function showTyping(callback) {
    const typing = document.createElement("div");
    typing.className = "bot-msg typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      typing.remove();
      callback();
    }, 1000);
  }

  function resetTimer() {
    clearTimeout(closeTimer);

    closeTimer = setTimeout(() => {
      if (!input.value.trim()) {
        chatBox.classList.remove("active");
      }
    }, 5000);
  }

  botMessage("Hi, I can help you grow your business");
  showTyping(() => botMessage("What is your name?"));

  input.addEventListener("keypress", (e) => {
    if (e.key !== "Enter" || input.value.trim() === "") {
      return;
    }

    const msg = input.value;
    userMessage(msg);
    input.value = "";

    if (step === 0) {
      lead.name = msg;
      showTyping(() => botMessage("Your phone number?"));
      step++;
    } else if (step === 1) {
      lead.phone = msg;
      showTyping(() => botMessage("Your business name?"));
      step++;
    } else if (step === 2) {
      lead.business = msg;
      showTyping(() => botMessage("What type of business? (Salon/Gym/etc)"));
      step++;
    } else if (step === 3) {
      lead.type = msg;
      showTyping(() => botMessage("Do you have a website? (Yes/No)"));
      step++;
    } else if (step === 4) {
      lead.website = msg;
      showTyping(() => botMessage("Monthly revenue?"));
      step++;
    } else if (step === 5) {
      lead.revenue = msg;
      showTyping(() => botMessage("What is your budget?"));
      step++;
    } else if (step === 6) {
      lead.budget = msg;
      showTyping(() => botMessage("Great! Connecting you on WhatsApp..."));

      const message = `Hi, I am ${lead.name}
Business: ${lead.business}
Type: ${lead.type}
Website: ${lead.website}
Revenue: ${lead.revenue}
Budget: ${lead.budget}`;

      setTimeout(() => {
        window.location.href =
          `https://wa.me/917015554342?text=${encodeURIComponent(message)}`;
      }, 1500);

      step = 0;
      lead = {};
    }
  });

  chatToggle.addEventListener("click", () => {
    chatBox.classList.add("active");
    resetTimer();
  });

  chatClose.addEventListener("click", () => {
    chatBox.classList.remove("active");
  });

  chatBox.addEventListener("mousemove", resetTimer);
  chatBox.addEventListener("keydown", resetTimer);

  document.addEventListener("click", (e) => {
    if (!chatBox.contains(e.target) && !chatToggle.contains(e.target)) {
      chatBox.classList.remove("active");
    }
  });
}

function initTestimonialSlider() {
  let index = 0;

  function updateSlide() {
    const track = document.getElementById("testimonialTrack");
    if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  window.nextSlide = function () {
    const total = document.querySelectorAll(".testimonial-card").length;
    if (!total) return;

    index = (index + 1) % total;
    updateSlide();
  };

  window.prevSlide = function () {
    const total = document.querySelectorAll(".testimonial-card").length;
    if (!total) return;

    index = (index - 1 + total) % total;
    updateSlide();
  };

  setInterval(() => {
    if (document.querySelectorAll(".testimonial-card").length > 1) {
      window.nextSlide();
    }
  }, 4000);
}

function initCaseSlider() {
  if (!document.getElementById("caseTrack")) {
    return;
  }

  let caseIndex = 0;

  function updateCase() {
    const track = document.getElementById("caseTrack");
    if (track) {
      track.style.transform = `translateX(-${caseIndex * 100}%)`;
    }
  }

  window.nextCase = function () {
    const total = document.querySelectorAll(".case-card").length;
    if (!total) return;

    caseIndex = (caseIndex + 1) % total;
    updateCase();
  };

  window.prevCase = function () {
    const total = document.querySelectorAll(".case-card").length;
    if (!total) return;

    caseIndex = (caseIndex - 1 + total) % total;
    updateCase();
  };

  setInterval(() => {
    if (document.querySelectorAll(".case-card").length > 0) {
      window.nextCase();
    }
  }, 5000);
}

function initLeadForm() {
  const form = document.getElementById("leadForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      business: formData.get("business"),
      type: formData.get("type"),
      website: formData.get("website"),
      revenue: formData.get("revenue"),
      budget: formData.get("budget")
    };

    const message = `Hi, I am ${data.name}
Business: ${data.business}
Type: ${data.type}
Website: ${data.website}
Revenue: ${data.revenue}
Budget: ${data.budget}`;

    try {
      const response = await fetch("/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        console.warn("Lead could not be saved:", result.message);
      }
    } catch (error) {
      console.warn("Lead capture request failed:", error.message);
    }

    window.location.href =
      `https://wa.me/917015554342?text=${encodeURIComponent(message)}`;
  });
}
