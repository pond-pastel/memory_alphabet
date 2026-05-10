let alphabet = [];
let flashAnswer = [];
let alphabetId = 0;
let hp = 0;
let score = 0;
let miss = [];
let NOT = 0;
let rnd = 0;
let state = "";
let howToOperate = "keyboard";
let data, count, effectTimer, effectMoveTimer;

function save() {
    const countEle = document.querySelector("#count");
    data.settings.count = Number(countEle.value);
    const flashEle = document.getElementById("count-of-alphabet");
    data.flashCount = flashEle.value;
    const letter = document.querySelector("#letter");
    data.settings.letter = letter.value;
    const modeEle = document.getElementById("mode");
    data.settings.mode = modeEle.value;
    const operateEle = document.getElementById("how-to-operate");
    data.settings.operate = operateEle.value;
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
                flashCount: 2,
                letter: "uppercase",
                mode: "normal",
                operate: ""
            },
            highScore: {},
            flashHighScore: null
        };
        save();
    }
    if(data.settings === undefined) {
        data.settings = {
            count: 2,
            flashCount: 2,
            letter: "uppercase",
            mode: "normal",
            operate: ""
        };
    }
    count = data.settings.count;
    if(data.highScore > 0) {
        const showHighScore = document.querySelector("#high-score");
        showHighScore.textContent = `ハイスコア: ${data.highScore[count]}`;
    }
    if(data.flashHighScore) {
        const flashHighScoreEle = document.getElementById("flash-high-score-record");
        flashHighScoreEle.textContent = `ハイスコア: ${data.flashHighScore}`;
    }
    const countEle = document.querySelector("#count");
    countEle.value = data.settings.count;
    const letter = document.querySelector("#letter");
    letter.value = data.settings.letter;
    if(data.settings.mode) {
        const modeEle = document.getElementById("mode");
        modeEle.value = data.settings.mode;
    }
    if(data.settings.operate) {
        const operateEle = document.getElementById("how-to-operate");
        operateEle.value = data.settings.operate;
    }
    if(data.flashCount) {
        const flashEle = document.getElementById("count-of-alphabet");
        flashEle.value = data.flashCount;
    }
    if(data.settings.operate === "touch") {
        operationSwitching();
    }
    countApply();
    highScoreApply();
    modeSwitch();
}

function modeSwitch() {
    const modeEle = document.getElementById("mode");
    const mode = modeEle.value;
    let showEles, hiddenEles;
    switch(mode) {
        case "normal":
            showEles = document.querySelectorAll(".normal-mode-content, #heart");
            hiddenEles = document.querySelectorAll(".flash-mode-content");
            break;
        case "flash":
            showEles = document.querySelectorAll(".flash-mode-content");
            hiddenEles = document.querySelectorAll(".normal-mode-content, #heart");
            break;
    }
    hiddenEles.forEach((h) => {
        h.style.display = "none";
    });
    showEles.forEach((s) => {
        s.style.display = null;
    });
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
    const flashHighScoreEle = document.getElementById("flash-high-score-record");
    if(data.flashHighScore) {
        flashHighScoreEle.textContent = `ハイスコア: ${data.flashHighScore}`;
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
    const modeEle = document.getElementById("mode");
    const mode = modeEle.value;
    const flashCountEle = document.getElementById("count-of-alphabet");
    const flashCount = flashCountEle.value;
    if(flashCount) {
        if(mode === "flash" && Number(flashCount) < Number(flashCountEle.min)) {
            alert(`${flashCountEle.min}以上の数値を設定してください。`);
            return;
        }
    } else if(mode === "flash") {
        alert("数値を設定してください。");
        return;
    }
    effectEnd();
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
    flashAnswer = [];
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
    alphabetSet(mode === "normal" ? data.settings.count + 1 : Number(flashCount));
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
        const result = document.querySelectorAll(".result, #flash-result");
        result.forEach((r) => {
            r.style.display = "none";
        });
        const settings = document.querySelectorAll(".settings, #alphabet");
        settings.forEach((s) => {
            s.style.display = null;
        });
        state = "";
        const choices = document.querySelector("#choices");
        choices.innerHTML = "";
        const historyEle = document.getElementById("flash-answer");
        historyEle.innerHTML = "";
        highScoreApply();
        effectStart();
    }
}

function nextAlphabet() {
    const alphabetArea = document.querySelector("#alphabet-area");
    alphabetArea.textContent = alphabet[alphabetId];
}

function touchKeyApply() {
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

function judgement(key) {
    const modeEle = document.getElementById("mode");
    const mode = modeEle.value;
    if(mode === "flash" && alphabet.length === flashAnswer.length) {
        returnToSetting(key);
        return;
    }
    if(alphabetId === alphabet.length && mode === "flash") {
        if(/^[a-z]$/i.test(key)) {
            const k = key.toUpperCase();
            const i = flashAnswer.length - 1;
            flashAnswer.push(k);
            const answerEle = document.getElementById("flash-answer");
            answerEle.innerHTML = "";
            flashAnswer.forEach((a) => {
                const answer = document.createElement("span");
                answer.classList.add("flash-answers");
                answer.textContent = data.settings.letter === "uppercase" ? a.toUpperCase() : a.toLowerCase();
                answerEle.append(answer);
            });
        }
        if(alphabet.length === flashAnswer.length) {
            flashEnd();
        }
        return;
    }
    if(((alphabet.length - 1 > alphabetId && mode === "normal") || mode === "flash") && key === " ") {
        alphabetId += 1;
        if(alphabet.length - 1 === alphabetId && mode === "normal") {
            const questionCount = document.querySelector("#question-count");
            questionCount.textContent = alphabetId;
            const next = document.querySelector("#next");
            const question = document.querySelector("#question");
            next.style.display = "none";
            question.style.display = null;
            if(howToOperate === "touch") {
                touchKeyApply();
            }
        } else if(mode === "flash" && alphabetId === alphabet.length) {
            const nextEle = document.getElementById("next");
            nextEle.style.display = "none";
            const alphabetEle = document.getElementById("alphabet");
            alphabetEle.style.display = "none";
            const inputEle = document.getElementById("flash-input");
            inputEle.style.display = null;
            if(howToOperate === "touch") {
                touchKeyApply();
            }
            return;
        }
    } else if(alphabet.length - 1 === alphabetId && /^[a-z]$/i.test(key) && mode === "normal") {
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
    nextAlphabet();
}

function flashEnd() {
    const playingEles = document.querySelectorAll(".playing, #flash-input");
    playingEles.forEach((p) => {
        p.style.display = "none";
    });
    const resultEle = document.getElementById("flash-result");
    resultEle.style.display = null;
    let clear = true;
    for(let i = 0;i < alphabet.length;i++) {
        if(alphabet[i].toUpperCase() !== flashAnswer[i].toUpperCase()) {
            clear = false;
        }
    }
    const titleEle = document.getElementById("flash-result-title");
    const spaceReturn = document.getElementById("flash-space-return");
    const touchReturn = document.getElementById("flash-touch-return");
    if(data.settings.operate === "touch") {
        spaceReturn.style.display = "none";
        touchReturn.style.display = null;
    } else {
        spaceReturn.style.display = null;
        touchReturn.style.display = "none";
    }
    if(!clear) {
        titleEle.textContent = "Game Over";
    } else {
        titleEle.textContent = "Game Clear";
        const clearEle = document.getElementById("flash-clear");
        clearEle.style.display = null;
        const score = alphabet.length;
        if(data.flashHighScore ?? 0 < score) {
            data.flashHighScore = score;
            const flashHighScoreEle = document.getElementById("flash-high-score-record");
            flashHighScoreEle.textContent = `ハイスコア: ${score}`;
            save();
        }
        const scoreEle = document.getElementById("flash-score");
        scoreEle.textContent = `Score: ${score}`;
        const highScoreEle = document.getElementById("flash-high-score");
        highScoreEle.textContent = `High Score: ${data.flashHighScore ?? 0}`;
    }
    const historyEle = document.getElementById("flash-historys");
    historyEle.innerHTML = "";
    const descriptionBox = document.createElement("div");
    descriptionBox.id = "flash-result-description";
    const descriptionAnswer = document.createElement("span");
    descriptionAnswer.textContent = "あなたの答え: ";
    descriptionBox.append(descriptionAnswer);
    const descriptionAlphabet = document.createElement("span");
    descriptionAlphabet.textContent = "正しい答え: ";
    descriptionBox.append(descriptionAlphabet);
    historyEle.append(descriptionBox);
    for(let i = 0;i < alphabet.length;i++) {
        const box = document.createElement("span");
        box.classList.add("flash-result-key-box");
        const historys = [document.createElement("p"), document.createElement("p")];
        historys[0].textContent = data.settings.letter === "uppercase" ? flashAnswer[i] : flashAnswer[i].toLowerCase();
        historys[1].textContent = data.settings.letter === "uppercase" ? alphabet[i] : alphabet[i].toLowerCase();
        historys.forEach((h) => {
            h.classList.add("flash-history");
            box.append(h);
        });
        if(alphabet[i].toUpperCase() !== flashAnswer[i].toUpperCase()) {
            historys[0].style.background = "var(--theme-ms)";
        }
        historyEle.append(box);
    }
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

function effectStart() {
    effectTimer = setInterval(effectAdd, 300);
    effectMoveTimer = setInterval(effectMove, 150);
}

function effectAdd() {
    const effectGroupEle = document.querySelector("#effect-group");
    const effect = document.createElement("span");
    effect.className = "effect";
    const randStr = String.fromCodePoint((data.settings.letter === "uppercase" ? 65 : 97) + Math.floor(Math.random() * 26));
    effect.textContent = randStr;
    for(let i = 0; i < 4; i++) {
        const inEffect = document.createElement("span");
        inEffect.className = "effect";
        inEffect.textContent = randStr;
        const bottom = 16 * (i + 1);
        inEffect.style.bottom = `${bottom}px`;
        effect.append(inEffect);
    }
    const x = Math.random() * (window.innerWidth - 16);
    effect.style.left = `${x}px`;
    effect.style.top = "0px";
    effectGroupEle.append(effect);
}

function effectMove() {
    const windowHeight = window.innerHeight;
    const effects = document.querySelectorAll(".effect:has(.effect)");
    effects.forEach((e) => {
        const y = Math.floor(e.getBoundingClientRect().bottom);
        if(y > windowHeight + (16 * 4)) {
            effectRemove(e);
        } else {
            e.style.top = `${y}px`;
        }
    });
}

function effectRemove(effect) {
    effect.remove();
}

function effectEnd() {
    clearInterval(effectTimer);
    effectTimer = null;
    clearInterval(effectMoveTimer);
    effectMoveTimer = null;
    const effectGroupEle = document.querySelector("#effect-group");
    effectGroupEle.innerHTML = "";
}

window.onload = function() {
    const modeEle = document.getElementById("mode");
    modeEle.addEventListener("input", () => {
        modeSwitch();
        save();
    });
    const countEle = document.querySelector("#count");
    countEle.addEventListener("input", () => {
        countApply();
        highScoreApply();
    });
    const flashEle = document.getElementById("count-of-alphabet");
    flashEle.addEventListener("input", () => {
        save();
    });
    const letter = document.querySelector("#letter");
    letter.addEventListener("input", () => {
        save();
    });
    const rules = document.querySelector("#rules");
    rules.addEventListener("click", () => {
        const modeEle = document.getElementById("mode");
        const mode = modeEle.value;
        alert(mode === "normal" ? `アルファベットを覚え、${count}個前のアルファベットを答えるルールです。\n${count}回間違えるとゲームオーバーです。` : `指定した数のアルファベットを覚え最後に順番に答えるルールです。\n1回間違えるとゲームオーバーです。`);
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
        save();
    });
    const flashReturnButton = document.getElementById("flash-touch-return-button");
    flashReturnButton.addEventListener("click", () => {
        returnToSetting(" ");
    });
    preparation();
    window.addEventListener("keydown", (e) => {
        keyDown(e.key);
    });
    effectStart();
}