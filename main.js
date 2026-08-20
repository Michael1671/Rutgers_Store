const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");


menuBtn.addEventListener("click",(e) => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
    origin:"bottom",
    distance: "50px",
    duration: 1000,
};

ScrollReveal().reveal(".header_image img", {
    ...scrollRevealOption,
    origin: "right",
});
ScrollReveal().reveal(".header_content h1", {
    ...scrollRevealOption,
    delay: 500,
});
ScrollReveal().reveal(".header_content p", {
    ...scrollRevealOption,
    delay: 1000,
});
ScrollReveal().reveal(".header_btns", {
    ...scrollRevealOption,
    delay: 1500,
});

const banner = document.querySelector(".banner_container");

if (banner) {
    const bannerContent = Array.from(banner.children);

    bannerContent.forEach((item) => {
        const duplicateNode = item.cloneNode(true);
        duplicateNode.setAttribute("aria-hidden", true);
        banner.appendChild(duplicateNode);
    });
}

ScrollReveal().reveal(".arrival_card", {
    ...scrollRevealOption,
    interval: 500,
});

ScrollReveal().reveal(".sale_image img", {
    ...scrollRevealOption,
    origin: "right",
});
ScrollReveal().reveal(".sale_content h2", {
    ...scrollRevealOption,
    delay: 500,
});
ScrollReveal().reveal(".sale_content p", {
    ...scrollRevealOption,
    delay: 1000,
});
ScrollReveal().reveal(".sale_content h4", {
    ...scrollRevealOption,
    delay: 1000,
});
ScrollReveal().reveal(".sale_btns", {
    ...scrollRevealOption,
    delay: 1500,
});
ScrollReveal().reveal(".favourite_card", {
    ...scrollRevealOption,
    interval: 500,
});
const contactUsBtn = document.getElementById("contact-us-btn");
const supportModal = document.getElementById("support-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
contactUsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    supportModal.classList.add("open");
});

modalCloseBtn.addEventListener("click", () => {
    supportModal.classList.remove("open");
});

supportModal.addEventListener("click", (e) => {
    if (e.target === supportModal) {
        supportModal.classList.remove("open");
    }
});

document.querySelectorAll(".qty_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const qtySpan = btn.parentElement.querySelector(".qty_value");
        let qty = parseInt(qtySpan.textContent);

        if (btn.dataset.action === "increase") {
            qty++;
        } else if (btn.dataset.action === "decrease" && qty > 1) {
            qty--;
        }

        qtySpan.textContent = qty;
    });
});

document.querySelectorAll(".checkout_item_remove").forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.closest(".checkout_item").remove();
    });
});