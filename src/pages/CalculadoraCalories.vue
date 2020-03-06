<template>
  <q-page class="flex flex-center">
    <q-input v-model.number="edat" type="number" filled style="max-width: 200px" />
    <q-input v-model.number="altura" type="number" filled style="max-width: 200px" />
    <q-input v-model.number="pes" type="number" filled style="max-width: 200px" />
    <q-radio v-model="radioSexe" val="home" label="Home" />
    <q-radio v-model="radioSexe" val="dona" label="Dona" />
    <q-btn @click="calculaCalories" color="white" text-color="black" label="Calcula" />
    <p>{{resultat}}</p>

    <section id="dragAndDrop">
      <!-- Drag and Drop-->
      <div id="opcionsDrag">
        <div id="pocCap" v-draggable="pocCap">Calories necessàries amb poc o cap exercici</div>
        <div
          id="lleuger"
          v-draggable="lleuger"
        >Calories necessàries amb exercici lleuger (1-3 dies per setmana)</div>
        <div
          id="moderat"
          v-draggable="moderat"
        >Calories necessàries amb exercici moderat (3-5 dies per setmana)</div>
        <div
          id="fort"
          v-draggable="fort"
        >Calories necessàries amb exercici fort (6 dies per setmana)</div>
        <div
          id="professional"
          v-draggable="professional"
        >Calories necessàries amb exercici professional o extrem</div>
      </div>

      <div id="destiDrag">Insereix activitat!</div>
      <input type="hidden" id="activitat" name="activitat" value="default" />
    </section>
  </q-page>
</template>

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
  width: 100px;
  height: 200px;
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
<script>
import { Draggable } from "draggable-vue-directive";
export default {
  name: "PageCalculadora",
  directives: {
    Draggable
  },
  data() {
    return {
      edat: "",
      altura: "",
      pes: "",
      radioSexe: "home",
      resultat: "",
      pocCap: {
        onPositionChange: this.onPosChanged,
        onDragEnd: this.onPosEnd,
        onDragStart: this.onPosStart,
        resetInitialPos: null
      },
      lleuger: "",
      moderat: "",
      fort: "",
      professional: ""
    };
  },
  methods: {
    onPosChanged: function(positionDiff, absolutePosition, event) {
      //console.log(positionDiff);
      console.log(absolutePosition)
      //console.log(absolutePosition);
      //console.log(event);
      //console.log("left corner", absolutePosition.left);
      //console.log("top corner", absolutePosition.top);

      console.log(event)
      if (absolutePosition.left > 980 && absolutePosition.left < 1180 && absolutePosition.top > 60 && absolutePosition.top < 260) {
          console.log("De dins")
      }
    },
    onPosEnd: function() {
      console.log("Acabat");
    },
    onPosStart: function() {
      console.log("Comença");
    },
    calculaCalories: function() {
      if (this.radioSexe === "home") {
        this.resultat = 10 * this.pes + 6.25 * this.altura - 5 * this.edat + 5;
      } else {
        this.resultat =
          10 * this.pes + 6.25 * this.altura - 5 * this.edat - 161;
      }
    }
  },
  mounted() {
  }
};
</script>