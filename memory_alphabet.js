let alphabet = [];
let alphabetId = 0;
let hp = 0;
let score = 0;
let miss = [];
let NOT = 0;
let rnd = 0;
let state = "";
let howToOperate = "keyboard";
let data, count;

function save() {
    const countEle = document.querySelector("#count");
    data.settings.count = Number(countEle.value);
    const letter = document.querySelector("#letter");
    data.settings.letter = letter.value;
    localStorage.setItem("memory_alphabet", JSON.stringify(data));
}

function preparation() {
    data = localStorage.getItem("memory_alphabet");
    if(data) {
        data = JSON.parse(data);
    } else {
        data = {
            settings: {
                count: 2,
                letter: "uppercase"
            },
            highScore: {}
        };
        save();
    }
    count = data.settings.count;
    if(data.highScore > 0) {
        const showHighScore = document.querySelector("#high-score");
        showHighScore.textContent = `ハイスコア: ${data.highScore[count]}`;
    }
    const countEle = document.querySelector("#count");
    countEle.value = data.settings.count;
    const letter = document.querySelector("#letter");
    letter.value = data.settings.letter;
    countApply();
    highScoreApply();
}

function countApply() {
    const countEle = document.querySelector("#count");
    count = Number(countEle.value);
    const showCount = document.querySelector("#show-count");
    showCount.textContent = count;
    save();
}

function highScoreApply() {
    const highScoreEle = document.querySelector("#high-score");
    if(data.highScore[count]) {
        highScoreEle.textContent = `ハイスコア: ${data.highScore[count]}`;
    } else {
        highScoreEle.textContent = "ハイスコア: 記録がありません。";
    }
}


function alphabetSet(cnt = 1) {
    for(let i = 0; i < cnt; i++) {
        const pnt = data.settings.letter === "uppercase" ? 65 : 97;
        rnd = (rnd + Math.floor(Math.random() * 24) + 1) % 26;
        const alpId = rnd + pnt;
        const newAlp = String.fromCodePoint(alpId);
        alphabet.push(newAlp);
    }
}

function start() {
    const settings = document.querySelectorAll(".settings");
    settings.forEach((s) => {
        s.style.display = "none";
    });
    const result = document.querySelectorAll(".result");
    result.forEach((r) => {
        r.style.display = "none";
    });
    const playing = document.querySelectorAll(".playing");
    playing.forEach((p) => {
        p.style.display = null;
    });
    const choices = document.querySelector("#choices");
    choices.innerHTML = "";
    state = "playing";
    alphabet = [];
    alphabetId = 0;
    score = 0;
    miss = [];
    NOT = 0;
    hp = count;
    heartApply();
    const next = document.querySelector("#next");
    const question = document.querySelector("#question");
    next.style.display = null;
    question.style.display = "none";
    const missGroup = document.querySelector("#miss-group");
    missGroup.innerHTML = "";
    alphabetSet(data.settings.count + 1);
    nextAlphabet();
}

function gameover() {
    hp = 0;
    heartApply();
    const settings = document.querySelectorAll(".settings");
    settings.forEach((s) => {
        s.style.display = "none";
    });
    const playing = document.querySelectorAll(".playing");
    playing.forEach((p) => {
        p.style.display = "none";
    });
    const result = document.querySelectorAll(".result");
    result.forEach((r) => {
        r.style.display = null;
    });
    const scoreEle = document.querySelector("#current-score-result");
    const highScoreEle = document.querySelector("#high-score-result");
    const highScore = data.highScore[count] ?? -1;
    const highScoreBG = document.querySelector("#high-score-bg");
    if(highScore <= score) {
        data.highScore[count] = score;
        save();
        highScoreBG.style.background = "linear-gradient(to right, var(--theme-hs) 10%, var(--theme-bg) 50%)";
    } else {
        highScoreBG.style.background = null;
    }
    scoreEle.textContent = score;
    highScoreEle.textContent = data.highScore[count];
    const missGroup = document.querySelector("#miss-group");
    let html = "";
    miss.forEach((m) => {
        const letter = document.querySelector("#letter");
        const yourAnswer = letter.value === "lowercase" ? m[2].toLowerCase() : m[2].toUpperCase();
        html += `<p class="miss">${m[0]}回目: [正しい答え: ${m[1]}] [あなたの回答: ${yourAnswer}]</p>`;
    });
    missGroup.innerHTML = html;
    state = "result";
}

function returnToSetting(key) {
    if(key === " ") {
        const playing = document.querySelectorAll(".playing");
        playing.forEach((p) => {
            p.style.display = "none";
        });
        const result = document.querySelectorAll(".result");
        result.forEach((r) => {
            r.style.display = "none";
        });
        const settings = document.querySelectorAll(".settings");
        settings.forEach((s) => {
            s.style.display = null;
        });
        state = "";
        const choices = document.querySelector("#choices");
        choices.innerHTML = "";
        highScoreApply();
    }
}

function nextAlphabet() {
    const alphabetArea = document.querySelector("#alphabet-area");
    alphabetArea.textContent = alphabet[alphabetId];
}

function judgement(key) {
    if(alphabet.length - 1 > alphabetId && key === " ") {
        alphabetId += 1;
        if(alphabet.length - 1 === alphabetId) {
            const questionCount = document.querySelector("#question-count");
            questionCount.textContent = alphabetId;
            const next = document.querySelector("#next");
            const question = document.querySelector("#question");
            next.style.display = "none";
            question.style.display = null;
            if(howToOperate === "touch") {
                const choices = document.querySelector("#choices");
                for(let i = 0;i < 26;i++) {
                    const choice = document.createElement("div");
                    choice.classList.add("alphabet");
                    choice.classList.add("choice");
                    const num = (data.settings.letter === "uppercase" ? 65 : 97) + i;
                    const str = String.fromCodePoint(num)
                    choice.textContent = str;
                    choice.addEventListener("click", () => {
                        judgement(str);
                    });
                    choices.append(choice);
                }
            }
        }
    } else if(alphabet.length - 1 === alphabetId && /^[a-z]$/i.test(key)) {
        const reg = new RegExp(alphabet[0], "i");
        const alphabetArea = document.querySelector("#alphabet-area");
        NOT += 1;
        if(reg.test(key)) {
            alphabetArea.style.background = null;
            score += 1;
        } else if(hp < 2) {
            alphabetArea.style.background = null;
            addMiss(key);
            gameover();
            return;
        } else {
            alphabetArea.style.background = "var(--theme-ms)";
            addMiss(key);
            hp -= 1;
            heartApply();
        }
        alphabet.shift();
        alphabetSet();
    }
    console.log("next");
    nextAlphabet();
}

function addMiss(key) {
    miss.push([NOT, alphabet[0], key]);
}

function heartApply() {
    const heartEle = document.querySelector("#heart");
    let heart = "";
    for(let i = 0; i < hp; i++) {
        heart += String.fromCodePoint(0x2665);
    }
    heartEle.textContent = heart;
}

function operationSwitching() {
    const HTO = document.querySelector("#how-to-operate");
    const keyboard = document.querySelectorAll(".keyboard");
    const touch = document.querySelectorAll(".touch");
    switch(HTO.value) {
        case "keyboard":
            howToOperate = "keyboard";
            keyboard.forEach((k) => {
                k.style.display = null;
            });
            touch.forEach((t) => {
                t.style.display = "none";
            });
            break;

        case "touch":
            howToOperate = "touch";
            keyboard.forEach((k) => {
                k.style.display = "none";
            });
            touch.forEach((t) => {
                t.style.display = null;
            });
            break;
    }
}

function keyDown(key) {
    if(howToOperate !== "keyboard") {
        return;
    }
    switch(state) {
        case "playing":
            judgement(key);
            break;

        case "result":
            returnToSetting(key);
            break;

        default:
            if(key === " ") {
                start();
            }
    }
}

function touchClick(s) {
    if(howToOperate !== "touch"){
        return;
    }
    switch(true) {
        case s.classList.contains("start"):
            start();
            break;

        case s.classList.contains("next"):
            judgement(" ");
            break;

        case s.classList.contains("return"):
            returnToSetting(" ");
            break;
    }
}

window.onload = function() {
    const countEle = document.querySelector("#count");
    countEle.addEventListener("input", () => {
        countApply();
        highScoreApply();
    });
    const letter = document.querySelector("#letter");
    letter.addEventListener("input", () => {
        save();
    });
    const rules = document.querySelector("#rules");
    rules.addEventListener("click", () => {
        alert(`アルファベットを覚え、${count}個前のアルファベットを答えるルールです。\n${count}回間違えるとゲームオーバーです。`);
    });
    const touch = document.querySelectorAll(".touch");
    touch.forEach((t) => {
        t.addEventListener("click", () => {
            touchClick(t);
        });
    });
    const HTO = document.querySelector("#how-to-operate");
    HTO.addEventListener("input", () => {
        operationSwitching();
    });
    if(window.innerWidth < 1000) {
        HTO.value = "touch";
        operationSwitching();
    }
    preparation();
    window.addEventListener("keydown", (e) => {
        keyDown(e.key);
    });
}