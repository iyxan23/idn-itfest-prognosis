const header = document.getElementById("header");
const main = document.getElementById("main");
const carousel = document.getElementById("carousel");
const carouselCards = document.getElementById("carousel-cards");
const bottomButtons = document.getElementById("bottom-buttons");

var cardPositions = Array.from(
            document.querySelectorAll("#carousel > #carousel-cards > .carousel-card").values()
        ).map((i) => i.offsetLeft);

var currentCardIndex = 0;

function updateSizes() {
    const headerRect = header.getBoundingClientRect();
    const bottomButtonsRect = bottomButtons.getBoundingClientRect();

    main.style.paddingTop = `calc(${headerRect.height}px + 3rem)`;

    if (document.documentElement.clientWidth < 768) {
        carousel.style.height = `calc(100vh - ${headerRect.height}px - 5rem)`
    } else {
        carousel.style.height = `calc(100vh - ${headerRect.height}px - ${bottomButtonsRect.height}px - 6.5rem)`
    }

    cardPositions = Array.from(document.querySelectorAll("#carousel > #carousel-cards > .carousel-card").values()).map((i) => i.offsetLeft);
}

carouselCards.onscroll = () => {
    currentCardIndex = cardPositions.indexOf(
        cardPositions.reduce(
            (prev, curr) => Math.abs(curr - carouselCards.scrollLeft) < Math.abs(prev - carouselCards.scrollLeft) ? curr : prev)
    );
};

function carouselLeft() {
    if (currentCardIndex != 0) {
        currentCardIndex -= 1;
        carouselCards.scrollTo(cardPositions[currentCardIndex], 0);
    }
}

function carouselRight() {
    if (currentCardIndex < cardPositions.length) {
        currentCardIndex += 1;
        carouselCards.scrollTo(cardPositions[currentCardIndex], 0);
    }
}

onresize = updateSizes;
updateSizes();