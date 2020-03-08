<template>
  <q-page>
    <div class="column">
      <q-input v-model.number="edat" type="number" filled style="max-width: 500px" label="Edat" />
      <q-input
        v-model.number="altura"
        type="number"
        filled
        style="max-width: 500px"
        label="Altura(cm)"
      />
      <q-input v-model.number="pes" type="number" filled style="max-width: 500px" label="Pes(kg)" />
      <q-radio v-model="radioSexe" val="home" label="Home" />
      <q-radio v-model="radioSexe" val="dona" label="Dona" />
      <div class="row">
        <div class="col-6">
          <draggable
            id="opcionsDrag"
            tag="div"
            v-model="activitatDiaria"
            v-bind="dragOptions"
            :move="onMove"
            @start="isDragging=true"
            @end="isDragging=false"
          >
            <transition-group type="transition" :name="'flip-list'">
              <div
                :id="element.id"
                :data-exercici="element.num"
                v-for="element in activitatDiaria"
                :key="element.order"
              >{{element.name}}</div>
            </transition-group>
          </draggable>
        </div>

        <div class="col-6">
          <draggable v-model="insereixActivitat" v-bind="dragOptions" :move="onMove">
            <transition-group id="destiDrag" name="no" tag="div">
              <div
                v-bind:id="element.id"
                v-for="element in insereixActivitat"
                :key="element.order"
              >{{element.name}}</div>
            </transition-group>
          </draggable>
        </div>
      </div>
      <q-btn @click="calculaCalories" color="white" text-color="black" label="Calcula" />
    </div>
    <section id="resultats">
      <div>
        <h3>Calories necessàries diarament:</h3>
        <p id="resultat">{{caloriesNecesaries}}</p>
      </div>
      <div>
        <h3>Calories de la teva dieta introduida:</h3>
        <p id="dieta">{{caloriesDieta}}</p>
      </div>
    </section>
    <div class="row">
      <div>
        <h2>Fes la teva dieta!</h2>
        <video ref="camera" :width="640" :height="480" autoplay></video>
        <div id="reconeixement">
          <p>Label: {{ml5Results.label}}</p>
          <p>Confidende: {{ml5Results.confidence}}</p>
        </div>
        <q-btn
          id="calculaDieta"
          @click="calculaDieta"
          color="white"
          text-color="black"
          label="CalculaDieta"
        />
        <q-btn id="elimina" @click="eliminaDieta" color="primary" label="Torna a crear dieta" />
      </div>
      <div id="totIngredients">
        <h2>Ingredients de la teva actual dieta:</h2>
        <p v-for="aliment in llistatAliments" :key="aliment">{{aliment}}</p>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import draggable from "vuedraggable";
import ml5 from "ml5";
import p5 from "vue-p5";
const noms = [
  {
    id: "pocCap",
    nom: "Calories necessàries amb poc o cap exercici",
    num: 1.2
  },
  {
    id: "lleuger",
    nom: "Calories necessàries amb exercici lleuger (1-3 dies per setmana)",
    num: 1.375
  },
  {
    id: "moderat",
    nom: "Calories necessàries amb exercici moderat (3-5 dies per setmana)",
    num: 1.55
  },
  {
    id: "fort",
    nom: "Calories necessàries amb exercici fort (6 dies per setmana)",
    num: 1.725
  },
  {
    id: "professional",
    nom: "Calories necessàries amb exercici professional o extrem",
    num: 1.9
  }
];
export default {
  name: "PageCalculadora",
  components: {
    draggable
  },
  data() {
    return {
      edat: "",
      altura: "",
      pes: "",
      radioSexe: "home",
      caloriesNecesaries: "",
      caloriesDieta: "",
      requestIndexedDB: "",
      editable: true,
      isDragging: false,
      delayedDragging: false,
      ml5Results: {
        label: "",
        confidence: ""
      },
      classifier: null,
      llistatAliments: [],
      alimentActual: "",
      activitatDiaria: noms.map((name, index) => {
        return {
          id: name.id,
          name: name.nom,
          num: name.num,
          order: index + 1,
          fixed: false
        };
      }),
      insereixActivitat: []
    };
  },
  methods: {
    calculaCalories: function() {
      let tmb = 0;
      if (this.radioSexe === "home") {
        tmb = 10 * this.pes + 6.25 * this.altura - 5 * this.edat + 5;
      } else {
        tmb = 10 * this.pes + 6.25 * this.altura - 5 * this.edat - 161;
      }

      this.caloriesNecesaries = tmb * this.insereixActivitat[0].num;
    },
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },
    createCameraElement() {
      const constraints = (window.constraints = {
        audio: false,
        video: {
          width: { min: 640 },
          height: { min: 480 }
        }
      });

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.$refs.camera.srcObject = stream;
        })
        .catch(error => {
          alert("May the browser didn't support or there is some errors.");
        });
    },
    setupML5() {
      this.classifier = ml5.imageClassifier(
        "MobileNet",
        this.$refs.camera,
        this.modelReady
      );
    },
    modelReady() {
      console.log("Model Ready");
      this.classifyVideo();
    },
    classifyVideo() {
      this.classifier.classify(this.gotResult);
    },
    gotResult(err, results) {
      this.ml5Results.label = results[0].label;
      this.ml5Results.confidence = results[0].confidence;

      if (results[0].confidence > 0.7) {
        this.addAliment(results[0].label);
      }

      this.classifyVideo();
    },
    async calculaDieta() {
      let aliments = await this.getAllAliments();
      this.caloriesDieta = await this.getCalories(aliments);
    },
    eliminaDieta() {
      const req = indexedDB.deleteDatabase("Aliments");
      this.llistatAliments = [];
      this.$q.notify({
        type: "negative",
        message: `La dieta s'ha eliminat correctament`
      });
      window.location.reload();
    },
    addAliment(alimentNou) {
      this.alimentActual = alimentNou;
      const db = this.requestIndexedDB.result;

      const transaction = db.transaction("aliment", "readwrite");
      const objectStore = transaction.objectStore("aliment");

      //Abans d'afegir el nou aliment, s'ha de veure si l'aliment es troba en la bbdd o no
      const aliments = objectStore.getAll();

      aliments.onsuccess = this.onsuccess;
    },
    onsuccess: function(e) {
      const db = this.requestIndexedDB.result;
      const totsAliments = e.target.result;
      let existeix = false;

      totsAliments.map(aliment => {
        //return aliment.nom === alimentNou;
        if (aliment.nom === this.alimentActual) {
          existeix = true;
        }
      });

      //Si no existeix, es comença a introduir l'aliment a la base de dades
      if (!existeix) {
        const transaction = db.transaction("aliment", "readwrite");
        const objectStore = transaction.objectStore("aliment");

        const newAliment = {
          nom: this.alimentActual
        };
        objectStore.add(newAliment);
        this.llistatAliments.push(this.alimentActual);
      }
    },
    getAllAliments() {
      return new Promise(function(resolve, reject) {
        var open = window.indexedDB.open("Aliments", 1);
        open.onsuccess = function() {
          var db = open.result;
          var transaction = db.transaction("aliment", "readwrite");
          var store = transaction.objectStore("aliment");
          var request = store.getAll();
          request.onsuccess = function(event) {
            resolve(event.target.result);
          };

          request.onerror = function(event) {
            reject(event);
          };

          // Close the db when the transaction is done
          transaction.oncomplete = function() {
            db.close();
          };
          transaction.onerror = function(event) {
            reject(event);
          };
        };
        open.onerror = function(event) {
          reject(event);
        };
      });
    },
    loadAliments(aliments) {
      aliments.map(aliment => {
        this.llistatAliments.push(aliment.nom);
      });
    },
    async getCalories(aliments) {
      const app_id = "32f2df88";
      const app_key = "53d0545fb61ad0cc3a9ea0af076a5e05";
      let arrayPromeses = [];

      aliments.forEach(async function(nameIngr) {
        let aliment = axios({
          method: "GET",
          url: `https://api.edamam.com/api/food-database/parser?app_id=${app_id}&app_key=${app_key}&ingr=${nameIngr.nom}`
        });

        arrayPromeses.push(aliment);
      });

      let sumaCal = 0;
      let arrayCalories = await Promise.all(arrayPromeses);

      arrayCalories.map(caloria => {
        sumaCal = sumaCal + caloria.data.hints[0].food.nutrients.ENERC_KCAL;
      });

      return sumaCal;
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: !this.editable,
        ghostClass: "ghost"
      };
    }
  },
  watch: {
    isDragging(newValue) {
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    }
  },
  mounted() {
    this.createCameraElement();
    this.setupML5();
    this.requestIndexedDB = window.indexedDB.open("Aliments", 1);

    this.requestIndexedDB.onupgradeneeded = async function(event) {
      const db = event.target.result;
      let objectStore = db.createObjectStore("aliment", {
        autoIncrement: true
      });
    };

    this.getAllAliments().then(this.loadAliments);
  }
};
</script>


<style lang="stylus" scoped>
#dragAndDrop {
  display: flex;
  flex-basis: 50%;
}

#destiDrag {
  border: 2px solid black;
  background-color: white;
  width: 200px;
  height: 200px;
  margin: 10px;
}

#destiDrag div {
  display: inline-block;
  width: 160px;
  height: 160px;
  border: 2px solid black;
  margin: 18px;
  font-size: 0.8em;
}

#opcionsDrag {
  display: flex;
  flex-wrap: nowrap;
}

#opcionsDrag div {
  width: 500px;
  height: 50px;
  border: 2px solid black;
  margin: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

#pocCap {
  background-color: #242424;
  color: white;
}

#lleuger {
  background-color: red;
}

#moderat {
  background-color: orange;
}

#fort {
  background-color: yellow;
}

#professional {
  background-color: green;
}

#resultats {
  width: 100%;
}

#resultats h3 {
  font-size: 1em;
}

#resultats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>
