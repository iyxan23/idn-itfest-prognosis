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
const infectedContent = document.getElementById("infected-content");

const answers = document.getElementById("answers");
const header = document.getElementById("box-header");
const subheader = document.getElementById("box-subheader");

var data; // fixed
var dataMod; // same as data but modified with the bias and removed the answered symptoms
var diseasesScores; // { name(str) -> score(int) }
var currentQuestion = ""; // symptom
var answered = {}; // { name(str) -> bool }

const treshold = 0.5;

// fetch("./data/diseases.json")
//     .then(data => data.json())
//     .then(json => { data = json; process(); });

var data = {
	"diseases": {
		"disease-a": {
			"name": "Disease A",
			"description": "Kelihatannya anda terkena Disease A, lorem ipsum dolor sir amet consectetur adipisicing elit. Exercitationem minima ipsam quis dignissimos, sit maxime ullam optio, ducimus quae at qui vitae magnam vero possimus. Dolorem quod tenetur numquam quisquam.",
			"link": "https://letmegooglethat.com/?q=lorem%20ipsum",
			"symptoms": {
				"nausea": 70,
				"cough": 90,
				"fever": 30
			}
		},
		"disease-b": {
			"name": "Disease B",
			"description": "Kelihatannya anda terkena Disease B, lorem ipsum dolor sir amet consectetur adipisicing elit. Exercitationem minima ipsam quis dignissimos, sit maxime ullam optio, ducimus quae at qui vitae magnam vero possimus. Dolorem quod tenetur numquam quisquam.",
			"link": "https://letmegooglethat.com/?q=lorem%20ipsum",
			"symptoms": {
				"vommiting": 90,
				"runny-nose": 40,
				"cough": 60,
				"fever": 30
			}
		},
        "disease-c": {
            "name": "Disease C",
            "description": "Kelihatannya anda terkena Disease B, lorem ipsum dolor sir amet consectetur adipisicing elit. Exercitationem minima ipsam quis dignissimos, sit maxime ullam optio, ducimus quae at qui vitae magnam vero possimus. Dolorem quod tenetur numquam quisquam.",
			"link": "https://letmegooglethat.com/?q=lorem%20ipsum",
			"symptoms": {
                "cough": 70,
				"vommiting": 60,
				"runny-nose": 20,
				"nausea": 5,
			}
        }
	},
	"questions": {
		"nausea": "Apakah kamu merasakan pusing?",
		"vommiting": "Apakah kamu merasakan muntah muntah?",
		"cough": "Apakah kamu batuk-batuk?",
		"runny-nose": "Apakah kamu pilek?",
		"fever": "Apakah kamu demam?"
	}
};

const dataFullScores = sumSymptoms(data);

// deep clone
dataMod = JSON.parse(JSON.stringify(data));
console.log(data);

process();

function process() {
    console.log("proces");
    console.log(dataMod);
    let symptomScores = sumSymptoms(dataMod);

    // find the max symptom
    let maxValue = Object.values(symptomScores)[0];
    let maxSymptom = Object.keys(symptomScores)[0];

    console.log(`maxVal: ${maxValue}`);

    // present when this is the last symptom
    if (Object.values(symptomScores).length === 1) {
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
    console.log(`${currentQuestion}: yes`);

    // do some magic bias stuff
    for (const diseaseName in dataMod.diseases) {
        const disease = dataMod.diseases[diseaseName];
        if (disease.symptoms[currentQuestion] === undefined) { continue; }

        const symptom = disease.symptoms[currentQuestion];

        for (const symptomName in disease.symptoms) {
            disease.symptoms[symptomName] += disease.symptoms[symptomName] * symptom/200;

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
    console.log(`total w/o max: ${average}`);
    console.log(`delta: ${maxScore - average}`);

    // or when the other items' average is above the treshold compared to the maximum symptom score
    if (maxScore - average >= treshold) {
        console.log("FOUND");
        console.log(maxName);
    }

    console.log(scores);
    for (const disease in scores) {
        if (scores[disease] >= 0.75) {
            // this is probably the disease we're looking for
            console.log(`prob disease: ${disease}`)
        }
    }

    // check for the treshold
    const continueAsking = process();

    if (continueAsking === false) {
        // present the most probable disease
        let max = 0;
        let maxName;

        for (const disease in scores) {
            if (scores[disease] > max) {
                max = scores[disease];
                maxName = disease;
            }
        }

        console.log(`present disease ${maxName}`);

        presentDisease(maxName);
    }
}

function answerNo() {
    answered[currentQuestion] = false;
    console.log(`${currentQuestion}: no`);

    // do some magic bias stuff
    for (const diseaseName in dataMod.diseases) {
        const disease = dataMod.diseases[diseaseName];
        if (disease.symptoms[currentQuestion] === undefined) { continue; }

        const symptom = disease.symptoms[currentQuestion];

        for (const symptomName in disease.symptoms) {
            disease.symptoms[symptomName] -= disease.symptoms[symptomName] * symptom/200;

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
    console.log(`total w/o max: ${average}`);
    console.log(`delta: ${maxScore - average}`);

    // or when the other items' average is above the treshold compared to the maximum symptom score
    if (maxScore - average >= treshold) {
        console.log("FOUND");
        console.log(maxName);
    }

    console.log(scores);

    const continueAsking = process();

    if (continueAsking === false) {
        // present the most probable disease
        let max = 0;
        let maxName;

        for (const disease in scores) {
            if (scores[disease] > max) {
                max = scores[disease];
                maxName = disease;
            }
        }

        console.log(`present disease ${maxName}`);

        presentDisease(maxName);
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