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
          tip: 'Crea aquest post',
          icon: 'save',
          label: 'Crea post',
          handler: saveWork
        },
        translate: {
          tip: 'Traduiex el teu post',
          icon: 'font_download',
          label: 'Traduiex post',
          handler: translateIt
        }
      }"
      :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
        ['save', 'translate']
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
          type: "positive",
          message: `S'ha creat correctament el post`
        });
      }
    },
    async translateIt() {
      console.log(this.selectIdiomes);

      const codeIdiomaOriginal = this.selectIdiomes[0].value;
      const codeIdiomaATraduir = this.selectIdiomes[1].value;
      console.log(codeIdiomaOriginal, codeIdiomaATraduir)

            //Traduim el titol i el content del post
            const titolTraduit = await translate(codeIdiomaOriginal, codeIdiomaATraduir, this.titolPost);
            const cosTraduit = await translate(codeIdiomaOriginal, codeIdiomaATraduir, this.descripcioPost);

            this.titolPost = titolTraduit.data;
            this.descripcioPost = cosTraduit.data;
            //I actualizam
            //tinymce.activeEditor.setContent(contentTraduit);
            //document.querySelector("#title").value = titleTraduit;
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