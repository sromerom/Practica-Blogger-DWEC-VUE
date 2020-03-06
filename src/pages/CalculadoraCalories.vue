<template>
  <q-page class="flex flex-center">
    <q-input v-model.number="edat" type="number" filled style="max-width: 200px" />
    <q-input v-model.number="altura" type="number" filled style="max-width: 200px" />
    <q-input v-model.number="pes" type="number" filled style="max-width: 200px" />
    <q-radio v-model="radioSexe" val="home" label="Home" />
    <q-radio v-model="radioSexe" val="dona" label="Dona" />
    <q-btn @click="calculaCalories" color="white" text-color="black" label="Calcula" />
    <p>{{resultat}}</p>

    <!-- 
        -label input select -> tornar a cridar languages
        -cors a axios.js -> No posar
        -part publica i part privada -> Crear un part publica semblant a la de blogger
        -forma d'actualitzar la taula
        -servei en boot -> Canviar a methods de cada page


    <section id="dragAndDrop">
      Drag and Drop
      <div id="opcionsDrag">
          <div id="pocCap" :key="pocCap">Calories necessàries amb poc o cap exercici</div>
          <div id="lleuger" :key="lleuger">Calories necessàries amb exercici lleuger (1-3 dies per setmana)</div>
          <div id="moderat" :key="moderat">Calories necessàries amb exercici moderat (3-5 dies per setmana)</div>
          <div id="fort" :key="fort">Calories necessàries amb exercici fort (6 dies per setmana)</div>
          <div id="professional" :key="professional">Calories necessàries amb exercici professional o extrem</div>
      </div>
     

      <div id="destiDrag">Insereix activitat!</div>
      <input type="hidden" id="activitat" name="activitat" value="default" />
    </section>
    -->
    <div class="col-md-3">
      <draggable
        id="opcionsDrag"
        class="list-group"
        tag="div"
        v-model="list"
        v-bind="dragOptions"
        :move="onMove"
        @start="isDragging=true"
        @end="isDragging=false"
      >
        <transition-group type="transition" :name="'flip-list'">
          <div
            :id="element.id"
            :data-exercici="element.num"
            class="list-group-item"
            v-for="element in list"
            :key="element.order"
          >
            {{element.name}}
            <span class="badge">{{element.order}}</span>
          </div>
        </transition-group>
      </draggable>
    </div>

    <div class="pp col-md-3">
      <draggable v-model="list2" v-bind="dragOptions" :move="onMove">
        <transition-group id="destiDrag" name="no" class="list-group" tag="div">
          <div
            v-bind:id="element.id"
            class="list-group-item"
            v-for="element in list2"
            :key="element.order"
          >
            {{element.name}}
            <span class="badge">{{element.order}}</span>
          </div>
        </transition-group>
      </draggable>
    </div>
    <div>
      <h2>Fes la teva dieta!</h2>
      <q-media-player type="video" :sources="sources" />
      <div id="reconeixement"></div>
      <button id="calculaDieta">CalculaDieta</button>
      <button id="elimina">Torna a crear dieta</button>
    </div>
    {{sources}}
  </q-page>
</template>

<script>
import draggable from "vuedraggable";
import md5 from "ml5";
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
      resultat: "",
      list: noms.map((name, index) => {
        return {
          id: name.id,
          name: name.nom,
          num: name.num,
          order: index + 1,
          fixed: false
        };
      }),
      list2: [],
      editable: true,
      isDragging: false,
      delayedDragging: false,
      sources: [
        {
          src: "",
          type: "video/mp4"
        }
      ]
    };
  },
  methods: {
    calculaCalories: function() {
      let tmb;
      console.log(this.pes, this.altura, this.edat);
      if (this.radioSexe === "home") {
        tmb = 10 * this.pes + 6.25 * this.altura - 5 * this.edat + 5;
      } else {
        tmb = 10 * this.pes + 6.25 * this.altura - 5 * this.edat - 161;
      }

      console.log(tmb);
      console.log(this.list2[0].num);
      console.log(parseInt(tmb) * parseInt(this.list2[0].num));
      this.resultat = tmb * this.list2[0].num;
      tmb = 0;
    },
    orderList() {
      this.list = this.list.sort((one, two) => {
        return one.order - two.order;
      });
    },
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
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
  created() {
    let classifier;
    let resultsP;
    let video;

    //Cream l'objecte constraint que fara servir API de la camara, mediaDevices
    const constraints = (window.constraints = {
      audio: false,
      video: {
        width: { min: 640 },
        height: { min: 480 }
      }
    });
    
    // Create a camera input
    //video = document.querySelector("#videoo");
    //console.log(video);
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      window.stream = stream; // make variable available to browser console
      //this.sources.src = stream;
    });
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
</style>
