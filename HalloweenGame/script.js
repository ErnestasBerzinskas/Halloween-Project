const startSection = document.getElementById("start");
const gameSection = document.getElementById("game");
const bonusSection = document.getElementById("bonus");
const resultSection = document.getElementById("result");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");
const againBtn = document.getElementById("againBtn");

const scareBtn = document.getElementById("scareBtn");
const scarePopup = document.getElementById("scarePopup");
const closeScare = document.getElementById("closeScare");
const scareEmoji = document.getElementById("scareEmoji");

let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "Player";
let answered = false;
let scareTimer = null;

const spookyEmojis = ["👹", "💀", "👻", "🤡", "🧟", "🎃"];

const backupQuestions = [
  {
    question: "Which creature is said to turn into a bat?",
    correct_answer: "Vampire",
    answers: ["Vampire", "Zombie", "Ghost", "Werewolf"]
  },
  {
    question: "What do people traditionally carve for Halloween?",
    correct_answer: "Pumpkins",
    answers: ["Apples", "Pumpkins", "Watermelons", "Pineapples"]
  },
  {
    question: "Which creature is associated with a full moon?",
    correct_answer: "Werewolf",
    answers: ["Mermaid", "Werewolf", "Fairy", "Elf"]
  },
  {
    question: "What do ghosts traditionally say?",
    correct_answer: "Boo!",
    answers: ["Hello!", "Boo!", "Goodbye!", "Welcome!"]
  },
  {
    question: "What does a witch traditionally fly on?",
    correct_answer: "Broomstick",
    answers: ["Umbrella", "Broomstick", "Bicycle", "Skateboard"]
  }
];

startBtn.addEventListener("click", startGame);

async function startGame() {
  playerName =
    document.getElementById("playerName").value.trim() || "Player";

  startBtn.disabled = true;
  document.getElementById("status").textContent =
    "Loading spooky questions... 👻";

  try {
    const response = await fetch(
      "https://opentdb.com/api.php?amount=5&category=11&type=multiple"
    );

    if (!response.ok) {
      throw new Error("API unavailable");
    }

    const data = await response.json();

    if (data.response_code !== 0 || !data.results.length) {
      throw new Error("No questions available");
    }

    questions = data.results.map(function (item) {
      const correct = decodeText(item.correct_answer);
      const answers = item.incorrect_answers.map(decodeText);

      answers.push(correct);
      shuffle(answers);

      return {
        question: decodeText(item.question),
        correct_answer: correct,
        answers: answers
      };
    });

    document.getElementById("status").textContent =
      "Questions loaded!";
  } catch (error) {
    questions = backupQuestions.map(function (item) {
      return {
        question: item.question,
        correct_answer: item.correct_answer,
        answers: [...item.answers]
      };
    });

    questions.forEach(function (item) {
      shuffle(item.answers);
    });

    document.getElementById("status").textContent =
      "Using backup questions!";
  }

  currentQuestion = 0;
  score = 0;

  startSection.hidden = true;
  gameSection.hidden = false;
  bonusSection.hidden = true;
  resultSection.hidden = true;

  document.getElementById("player").textContent = playerName;
  document.getElementById("score").textContent = score;

  startBtn.disabled = false;

  stopScares();
  showQuestion();
  startScareTimer();
}

function decodeText(text) {
  const decoder = document.createElement("textarea");
  decoder.innerHTML = text;
  return decoder.value;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showQuestion() {
  answered = false;

  const item = questions[currentQuestion];

  document.getElementById("number").textContent = currentQuestion + 1;
  document.getElementById("question").textContent = item.question;

  document.getElementById("bar").style.width =
    ((currentQuestion + 1) / questions.length) * 100 + "%";

  document.getElementById("feedback").textContent = "";
  nextBtn.hidden = true;

  const answersBox = document.getElementById("answers");
  answersBox.innerHTML = "";

  item.answers.forEach(function (answer) {
    const button = document.createElement("button");
    button.textContent = answer;

    button.addEventListener("click", function () {
      checkAnswer(answer, button);
    });

    answersBox.appendChild(button);
  });
}

function checkAnswer(answer, selectedButton) {
  if (answered) return;

  answered = true;

  const correctAnswer = questions[currentQuestion].correct_answer;
  const feedback = document.getElementById("feedback");
  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach(function (button) {
    button.disabled = true;

    if (button.textContent === correctAnswer) {
      button.style.background = "#15803d";
    }
  });

  if (answer === correctAnswer) {
    score += 10;
    feedback.textContent = "✅ Correct! The monster approves!";
  } else {
    feedback.textContent = "👻 The answer was " + correctAnswer;
    selectedButton.style.background = "#b91c1c";
  }

  document.getElementById("score").textContent = score;
  nextBtn.hidden = false;
}

nextBtn.addEventListener("click", function () {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    stopScares();
    gameSection.hidden = true;
    bonusSection.hidden = false;
  }
});

document.querySelectorAll(".bonusAnswer").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".bonusAnswer").forEach(function (item) {
      item.disabled = true;
    });

    if (button.dataset.answer === "yes") {
      score += 10;
      document.getElementById("bonusFeedback").textContent =
        "🎉 Correct! You earned 10 bonus points!";
    } else {
      document.getElementById("bonusFeedback").textContent =
        "👻 Yes, vampires are mythical creatures!";
    }

    document.getElementById("score").textContent = score;
    finishBtn.hidden = false;
  });
});

finishBtn.addEventListener("click", function () {
  stopScares();

  bonusSection.hidden = true;
  resultSection.hidden = false;

  document.getElementById("resultText").textContent =
    "Great job, " + playerName + "! You survived!";

  document.getElementById("finalScore").textContent = score + " points";
});

againBtn.addEventListener("click", function () {
  stopScares();

  resultSection.hidden = true;
  bonusSection.hidden = true;
  gameSection.hidden = true;
  startSection.hidden = false;

  document.getElementById("playerName").value = playerName;
  document.getElementById("status").textContent = "Ready to play?";
  document.getElementById("bonusFeedback").textContent = "";

  document.querySelectorAll(".bonusAnswer").forEach(function (button) {
    button.disabled = false;
  });

  finishBtn.hidden = true;
});

function startScareTimer() {
  stopScares();

  function showScare() {
    if (!gameSection.hidden && scarePopup.hidden) {
      const maxX = Math.max(0, window.innerWidth - 85);
      const maxY = Math.max(0, window.innerHeight - 85);

      scareBtn.style.left = Math.random() * maxX + "px";
      scareBtn.style.top = Math.random() * maxY + "px";

      scareBtn.textContent =
        spookyEmojis[Math.floor(Math.random() * spookyEmojis.length)];

      scareBtn.hidden = false;
    }

    scareTimer = setTimeout(showScare, 7000);
  }

  scareTimer = setTimeout(showScare, 5000);
}

scareBtn.addEventListener("click", function () {
  scareEmoji.textContent = scareBtn.textContent;
  scarePopup.hidden = false;
  scareBtn.hidden = true;
});

closeScare.addEventListener("click", function () {
  scarePopup.hidden = true;
});

scarePopup.addEventListener("click", function (event) {
  if (event.target === scarePopup) {
    scarePopup.hidden = true;
  }
});

function stopScares() {
  clearTimeout(scareTimer);
  scareTimer = null;

  scareBtn.hidden = true;
  scarePopup.hidden = true;
}
