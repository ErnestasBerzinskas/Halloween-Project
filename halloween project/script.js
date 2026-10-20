let scareTimeout;
let scareAudio;

const books = document.querySelectorAll(".books .book");

const stories = {
    book1: {
        title: "WITCHCRAFT",
        text: "An ancient witch hid her most powerful spell inside this book. Three candles flickered as a mysterious voice whispered from the shadows.",
        game: "Guess the magic word!",
        answer: "witch"
    },
    book2: {
        title: "DARK MAGIC",
        text: "A mysterious book appeared in the darkest corner of the library. When it opened, black smoke escaped from its pages.",
        game: "What appears at night and disappears in sunlight?",
        answer: "shadow"
    },
    book3: {
        title: "GHOSTS",
        text: "Every Halloween, a ghost appeared inside an abandoned mansion. Nobody knew what secret it was trying to reveal.",
        game: "What can go through walls?",
        answer: "ghost"
    },
    book4: {
        title: "CURSES",
        text: "An ancient curse returned every hundred years, searching for someone brave enough to break its spell.",
        game: "What breaks a curse in a fairy tale?",
        answer: "spell"
    },
    book5: {
        title: "POTIONS",
        text: "Moon dust, spider silk, and a mysterious purple flower were all the potion needed. The cauldron began to glow.",
        game: "What does a witch brew?",
        answer: "potion"
    },
    book6: {
        title: "MYSTERY",
        text: "A strange map revealed a secret room beneath the library. Behind the bookshelf, a hidden door slowly opened.",
        game: "What opens a locked door?",
        answer: "key"
    }
};

const overlay = document.createElement("div");
overlay.id = "book-overlay";
overlay.setAttribute("aria-hidden", "true");

overlay.innerHTML = `
    <div class="open-book" role="dialog" aria-modal="true"
         aria-label="Open storybook">
        <button class="close-book" aria-label="Close book"
                title="Close book">&times;</button>
        <section class="book-page left-page"></section>
        <section class="book-page right-page"></section>
    </div>
`;

document.body.appendChild(overlay);

const leftPage = overlay.querySelector(".left-page");
const rightPage = overlay.querySelector(".right-page");
const closeButton = overlay.querySelector(".close-book");

let activeBook = null;

function openBook(book) {
    const type = [...book.classList].find(name =>
        Object.prototype.hasOwnProperty.call(stories, name)
    );

    const story = stories[type];
    if (!story) return;

    activeBook = book;

    leftPage.replaceChildren();
    rightPage.replaceChildren();

    const leftTitle = document.createElement("h2");
    leftTitle.textContent = story.title;

    const storyText = document.createElement("p");
    storyText.textContent = story.text;

    leftPage.append(leftTitle, storyText);

    const gameTitle = document.createElement("h2");
    gameTitle.textContent = "🎃 Mini Mystery";

    const gameQuestion = document.createElement("p");
    gameQuestion.textContent = story.game;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type your answer...";
    input.setAttribute("aria-label", "Your answer");
    input.autocomplete = "off";
    input.style.cssText =
        "width:90%;padding:12px;border:1px solid #ad8956;" +
        "border-radius:8px;font:16px Georgia;";

    const submit = document.createElement("button");
    submit.textContent = "Check Answer";
    submit.type = "button";
    submit.style.cssText =
        "margin-top:12px;padding:12px 18px;border:0;" +
        "border-radius:8px;background:#56318c;color:white;" +
        "font:16px Georgia;cursor:pointer;";

    const feedback = document.createElement("p");
    feedback.className = "game-feedback";
    feedback.setAttribute("aria-live", "polite");

    const gameArea = document.createElement("div");
    gameArea.className = "mini-game";
    gameArea.append(gameQuestion, input, submit, feedback);

    function checkAnswer() {
        if (input.value.trim().toLowerCase() === story.answer) {
            feedback.textContent = "✨ Correct! The magic is yours!";
            feedback.style.color = "#286b35";
        } else {
            feedback.textContent = "👻 Not quite! Try again...";
            feedback.style.color = "#7a261f";
        }
    }

    submit.addEventListener("click", checkAnswer);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") checkAnswer();
    });

    rightPage.append(gameTitle, gameArea);

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeButton.focus();
}

function closeBook() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeBook = null;
}

books.forEach(book => {
    book.addEventListener("click", () => openBook(book));

    book.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openBook(book);
        }
    });
});

closeButton.addEventListener("click", closeBook);

overlay.addEventListener("click", event => {
    if (event.target === overlay) closeBook();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeBook();
        closeScare();
    }
});

function jumpScare() {
    const screen = document.getElementById("scare-screen");
    if (!screen) return;

    clearTimeout(scareTimeout);

    screen.classList.remove("active");
    void screen.offsetWidth;
    screen.classList.add("active");

    try {
        scareAudio = new Audio(
            "https://www.myinstants.com/media/sounds/movie_1.mp3"
        );
        scareAudio.volume = 0.7;
        scareAudio.play().catch(() => {});
    } catch (error) {
    }

    scareTimeout = setTimeout(closeScare, 2500);
}

function closeScare() {
    clearTimeout(scareTimeout);

    const screen = document.getElementById("scare-screen");

    if (screen) {
        screen.classList.remove("active");
    }

    if (scareAudio) {
        scareAudio.pause();
        scareAudio.currentTime = 0;
    }
}
