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
        -label input select
        -cors a axios.js
        -part publica i part privada
        -forma d'actualitzar la taula
        -servei en boot


    <section id="dragAndDrop">
      Drag and Drop
      <div id="opcionsDrag">
        <draggable v-model="divs" group="people" @start="drag=true" @end="drag=false">
          <div id="pocCap" :key="pocCap">Calories necessàries amb poc o cap exercici</div>
          <div id="lleuger" :key="lleuger">Calories necessàries amb exercici lleuger (1-3 dies per setmana)</div>
          <div id="moderat" :key="moderat">Calories necessàries amb exercici moderat (3-5 dies per setmana)</div>
          <div id="fort" :key="fort">Calories necessàries amb exercici fort (6 dies per setmana)</div>
          <div id="professional" :key="professional">Calories necessàries amb exercici professional o extrem</div>
        </draggable>
      </div>
     

      <div id="destiDrag">Insereix activitat!</div>
      <input type="hidden" id="activitat" name="activitat" value="default" />
    </section>
    -->
     <div class="col-md-3">
      <draggable class="list-group" tag="div" v-model="list" v-bind="dragOptions" :move="onMove" @start="isDragging=true" @end="isDragging=false">
        <transition-group type="transition" :name="'flip-list'">
          <p class="list-group-item" v-for="element in list" :key="element.order">
            {{element.name}}
            <span class="badge">{{element.order}}</span>
          </p>
        </transition-group>
      </draggable>
    </div>

    <div class="pp col-md-3">
      <draggable element="span" v-model="list2" v-bind="dragOptions" :move="onMove">
        <transition-group name="no" class="list-group" tag="ul">
          <p class="list-group-item" v-for="element in list2" :key="element.order">
            {{element.name}}
            <span class="badge">{{element.order}}</span>
          </p>
        </transition-group>
      </draggable>
    </div>
  </q-page>
</template>

<script>
import draggable from "vuedraggable";
const message = [
  "vue.draggable",
  "draggable",
  "component",
  "for",
  "vue.js 2.0",
  "based",
  "on",
  "Sortablejs"
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
      list: message.map((name, index) => {
        return { name, order: index + 1, fixed: false };
      }),
      list2: [],
      editable: true,
      isDragging: false,
      delayedDragging: false
    };
  },
  methods: {
    calculaCalories: function() {
      if (this.radioSexe === "home") {
        this.resultat = 10 * this.pes + 6.25 * this.altura - 5 * this.edat + 5;
      } else {
        this.resultat =
          10 * this.pes + 6.25 * this.altura - 5 * this.edat - 161;
      }
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
    },
    listString() {
      return JSON.stringify(this.list, null, 2);
    },
    list2String() {
      return JSON.stringify(this.list2, null, 2);
    }
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    }
  }
};
</script>

<style>
.pp {
    background-color: red;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
</style>
<!--
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
-->