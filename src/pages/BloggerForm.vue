<template>
  <div class="q-pa-md q-gutter-sm">
    <q-input v-model="titolPost" label="Titol del post..." />
    <q-select
      filled
      v-model="selectIdiomes"
      multiple
      :options="idiomes"
      counter
      max-values="2"
      hint="Max 2 selections"
      style="width: 250px"
    />
    <q-editor
      v-model="descripcioPost"
      :definitions="{
        save: {
          tip: 'Save your work',
          icon: 'save',
          label: 'Crea post',
          handler: saveWork
        }
      }"
      :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
        ['save']
      ]"
    />
  </div>
</template>

<script>
import { Post } from "../boot/post.js";
import {
  createPost,
  updatePost,
  getPostById,
  getLanguages,
  translate
} from "../boot/postServei.js";
export default {
  name: "BloggerForm",
  data() {
    return {
      titolPost: "",
      descripcioPost: "",
      selectIdiomes: null,
      idiomes: []
    };
  },
  methods: {
    async saveWork() {
      const tagIdiomesSeleccionat = [
        this.selectIdiomes[0].value,
        this.selectIdiomes[1].value
      ];
      if (this.titolPost != "" || this.descripcioPost != "") {
        console.log("Esta buits!!");
        await createPost(
          new Post(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.titolPost,
            this.descripcioPost,
            tagIdiomesSeleccionat
          )
        );

        this.$q.notify({
          message: "Creat el post correctament",
          color: "green-4",
          textColor: "white",
          icon: "cloud_done"
        });
      }
    }
  },
  async mounted() {
    const allLanguages = await getLanguages();
    allLanguages.data.forEach(language => {
      let obj = {
        //code, name
        label: language.name,
        value: language.code
      };
      this.idiomes.push(obj);
    });
  }
};
</script>