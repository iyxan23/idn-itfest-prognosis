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

const treshold = 0.75;

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
				"vommiting": 90,
				"runny-nose": 40,
				"cough": 60,
				"fever": 30
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
    console.log(dataMod);
    let symptomScores = sumSymptoms(dataMod);

    // find the max symptom
    let maxValue = Object.values(symptomScores)[0];
    let maxSymptom = Object.keys(symptomScores)[0];

    if (maxValue.length === 0) {
        // we ran out of questions, present the most probable disease
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
    console.log(scores);
    for (const disease in scores) {
        if (scores[disease] >= 0.75) {
            // this is probably the disease we're looking for
            console.log(`prob disease: ${disease}`)
        }
    }

    // check for the treshold
    process();
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
    console.log(scores);
    for (const disease in scores) {
        if (scores[disease] >= 0.75) {
            // this is probably the disease we're looking for
        }
    }

    // check for the treshold
    process();
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

        for (const symptom in dataMod.diseases[disease].symptoms) {
            if (answered[symptom] === true) {
                diseaseScore += data.diseases[disease].symptoms[symptom];
            } else if (answered[symptom] === undefined) {
                diseaseScore += dataMod.diseases[disease].symptoms[symptom];
            }
        }

        console.log(`${disease}: ${diseaseScore}/${diseaseTotalScore}`);

        acc[disease] = diseaseScore / diseaseTotalScore;
    }

    return acc;
}