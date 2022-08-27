const header = document.getElementById("header");
const main = document.getElementById("main");
const carousel = document.getElementById("carousel");
const bottomButtons = document.getElementById("bottom-buttons");

const headerRect = header.getBoundingClientRect();
const bottomButtonsRect = bottomButtons.getBoundingClientRect();

main.style.paddingTop = `calc(${headerRect.height}px + 2rem)`;
carousel.style.height = `calc(100vh - ${headerRect.height}px - ${bottomButtonsRect.height}px - 4.5rem)`