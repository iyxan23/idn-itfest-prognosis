/**
 * So the algorithm of this is very simple but complicated to explain.
 * 
 * To be honest, I don't think it's very accurate as it only has an input
 * of the symptoms of the user and does some evaluations depending on the
 * weights of the symptom of each diseases.
 * 
 * On each of the diseases on the data, it has a map of symptoms that
 * stores their weight.
 * 
 * The order of questions that'll be asked to the user descends from the
 * most popular (that has the most total weight of all diseases) to the
 * lowest.
 * 
 * There's something called as "scores" of which each disease has a
 * value of, it ranges from 0-1 that represents how probable a disease
 * is. Every disease starts from 1 and gets less and less each time the
 * user answer questions.
 * 
 * A disease's score gets reduced by the weight of a symptom if that
 * symptom is answered as "no", and otherwise.
 * 
 * Checking whether a disease is probable is done by getting the max
 * score of a disease, separating it from the other scores, then the
 * other scores gets averaged, compared with the max if it reaches
 * whithin a threshold.
 */

const infected = document.getElementById("infected");
const disclamer = document.getElementById("disclamer");
const infectedContent = document.getElementById("infected-content");

const answers = document.getElementById("answers");
const header = document.getElementById("box-header");
const subheader = document.getElementById("box-subheader");

var data;            // fixed
var dataMod;         // same as data but modified with the bias and removed the answered symptoms
var diseasesScores;  // { name(str) -> score(int) }
var currentQuestion; // symptom
var answered = {};   // { name(str) -> bool }

const treshold = 0.5;

// source: http://www.diseasesdatabase.com/
var data = {
	"diseases": {
        "influenza": {
            "name": "Influenza",
            "description": "Sepertinya anda terkena virus Influenza. Influenza merupakan salah satu virus yang sangat umum terjadi pada banyak orang. Influenza dapat mematikan pada kelompok-kelompok yang beresiko tinggi (seperti lansia, atau memiliki masalah imun).",
            "symptoms": {
                "headache": 70,
                "fever": 70,
                "muscle-pain": 30,
            }
        },
        "migraine": {
            "name": "Migraine",
            "description": "Sepertinya anda terkena Migraine. Migraine merupakan ganggunan kronis yang biasanya terjadi perasaan sakit kepala pada salah satu bagian kepala. Migraine dapat terjadi dalam berbagai macam intensitas.",
            "symptoms": {
                "headache": 70,
                "vomiting": 40,
            }
        },
        "covid": {
            "name": "COVID-19",
            "description": "Sepertinya anda terkena COVID. Coronavirus merupakan virus yang dapat menular, awalnya terjadi di Wuhan, Cina. Sekarang virus ini terlah tersebar ke seluruh dunia dan membuat seluruh dunia dalam status pandemi.",
            "symptoms": {
                "cough": 70,
                "headache": 70,
                "fever": 70,
            }
        }
	},
	"questions": {
        "muscle-pain": "Apakah kamu merasakan nyeri otot?",
		"headache": "Apakah kamu merasakan pusing?",
		"vomiting": "Apakah kamu merasakan muntah muntah?",
		"cough": "Apakah kamu batuk-batuk?",
		"fever": "Apakah kamu demam?",
	}
};

const dataFullScores = sumSymptoms(data);

dataMod = JSON.parse(JSON.stringify(data));

process();

function process() {
    let symptomScores = sumSymptoms(dataMod);

    // find the max symptom
    let maxValue = Object.values(symptomScores)[0];
    let maxSymptom = Object.keys(symptomScores)[0];

    // when we have no more questions left
    if (Object.values(symptomScores).length === 0) {
        return false;
    }

    for (const symptom in symptomScores) {
        if (symptomScores[symptom] > maxValue) {
            maxValue = symptomScores[symptom];
            maxSymptom = symptom;
        }
    }

    // then ask it
    currentQuestion = maxSymptom;
    subheader.textContent = dataMod.questions[maxSymptom];

    return true;
}

function answerYes() {
    answered[currentQuestion] = true;

    // do some magic bias stuff
    for (const diseaseName in dataMod.diseases) {
        const disease = dataMod.diseases[diseaseName];
        if (disease.symptoms[currentQuestion] === undefined) { continue; }

        const symptom = disease.symptoms[currentQuestion];

        for (const symptomName in disease.symptoms) {
            disease.symptoms[symptomName] += disease.symptoms[symptomName] * symptom/350;

            if (disease.symptoms[symptomName] > 100) {
                disease.symptoms[symptomName] = 100;
            }
        }
    }

    // remove the symptom itself
    removeSymptom();
    
    // calculate scores
    const scores = calculateDiseaseScore();

    // find the max score
    let maxScore = 0;
    let maxName;

    for (const name in scores) {
        if (maxScore < scores[name]) {
            maxScore = scores[name];
            maxName = name;
        }
    }

    const scores_ = JSON.parse(JSON.stringify(scores));
    delete scores_[maxName];

    const average = Object.values(scores_).reduce((acc, val) => acc + val, 0) / Object.values(scores).length;

    // or when the other items' average is above the treshold compared to the maximum symptom score
    if (maxScore - average >= treshold) {
        presentDisease(maxName);
        return;
    }

    if (process() === false) { 
        infected.style.display = "inherit";
        disclamer.style.display = "none";
        answers.style.display = "none";

        infectedContent.innerText = "Kita tidak dapat memprediksi penyakit apa yang anda derita.";
        subheader.innerText = "Tak diketahui";
    }
}

function answerNo() {
    answered[currentQuestion] = false;

    // do some magic bias stuff
    for (const diseaseName in dataMod.diseases) {
        const disease = dataMod.diseases[diseaseName];
        if (disease.symptoms[currentQuestion] === undefined) { continue; }

        const symptom = disease.symptoms[currentQuestion];

        for (const symptomName in disease.symptoms) {
            disease.symptoms[symptomName] -= disease.symptoms[symptomName] * symptom/350;

            if (disease.symptoms[symptomName] > 100) {
                disease.symptoms[symptomName] = 100;
            }
        }
    }

    // remove the symptom itself
    removeSymptom();
    
    // calculate scores
    const scores = calculateDiseaseScore();

    // find the max score;
    let maxScore = 0;
    let maxName;

    for (const name in scores) {
        if (maxScore < scores[name]) {
            maxScore = scores[name];
            maxName = name;
        }
    }

    const scores_ = JSON.parse(JSON.stringify(scores));
    delete scores_[maxName];

    const average = Object.values(scores_).reduce((acc, val) => acc + val, 0) / Object.values(scores).length;

    // or when the other items' average is above the treshold compared to the maximum symptom score
    if (maxScore - average >= treshold) {
        presentDisease(maxName);
        return;
    }
    
    if (process() === false) { 
        infected.style.display = "inherit";
        disclamer.style.display = "none";
        answers.style.display = "none";

        infectedContent.innerText = "We're unable to predict what kind of disease you have.";
        subheader.innerText = "Unknown";
    }
}

function presentDisease(diseaseName) {
    infected.style.display = "inherit";
    answers.style.display = "none";

    infectedContent.innerText = dataMod.diseases[diseaseName].description;
    subheader.innerText = dataMod.diseases[diseaseName].name;
}

function removeSymptom() {
    for (const diseaseName in dataMod.diseases) {
        const disease = dataMod.diseases[diseaseName];
        if (disease.symptoms[currentQuestion] !== undefined) {
            delete disease.symptoms[currentQuestion];
        }
    }
}

function sumSymptoms(data) {
    let symptomScores = {};

    for (const disease in data.diseases) {
        for (const symptom in data.diseases[disease].symptoms) {
            if (symptomScores[symptom] === undefined) { symptomScores[symptom] = 0; }

            symptomScores[symptom] +=
                data.diseases[disease].symptoms[symptom];
        }
    }

    return symptomScores;
}

function calculateDiseaseScore() {
    let acc = {};

    for (const disease in data.diseases) {
        let diseaseTotalScore = 0;
        let diseaseScore = 0;

        for (const symptom in data.diseases[disease].symptoms) {
            diseaseTotalScore += data.diseases[disease].symptoms[symptom];
        }

        for (const symptom in data.diseases[disease].symptoms) {
            if (answered[symptom] === true) {
                diseaseScore += data.diseases[disease].symptoms[symptom];
            } else if (answered[symptom] === undefined) {
                diseaseScore += dataMod.diseases[disease].symptoms[symptom];
            }
        }

        acc[disease] = diseaseScore / diseaseTotalScore;
    }

    return acc;
}