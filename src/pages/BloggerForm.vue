<template>
  <div class="q-pa-md q-gutter-sm">
    <q-input v-model="titolPost" label="Titol del post..." />
    <q-select
      filled
      v-model="selectIdiomes"
      multiple
      use-input
      input-debounce="0"
      label="Idiomes"
      :options="idiomes"
      counter
      max-values="2"
      hint="Idioma original, idioma a traduir"
      @filter="filterSelect"
      style="width: 250px"
      behavior="menu"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </template>
    </q-select>

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
    <section id="recordAudio">
      <video ref="camera" :width="640" :height="480" autoplay></video>
      <div id="buttons">
        <q-btn
          id="record"
          @click="recordAudio"
          color="white"
          text-color="black"
          label="Start Record"
        />
        <q-btn id="stop" @click="stopAudio" color="primary" label="Stop Record" />
      </div>
      <div id="soundClips"></div>
    </section>
    {{idiomesFilter}}
  </div>
</template>

<script>
import axios from "axios";
import { Post } from "../boot/post.js";
//import { createPost, getLanguages, translate } from "../boot/postServei.js";
export default {
  name: "BloggerForm",
  data() {
    return {
      titolPost: "",
      descripcioPost: "",
      selectIdiomes: null,
      idiomes: [],
      idiomesFilter: [],
      mediaRecorder: "",
      chunksAudio: []
    };
  },
  methods: {
    filterSelect(val, update) {
      if (val === "") {
        update(() => {
          this.idiomes = this.idiomesFilter;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.idiomes = this.idiomesFilter.filter(idioma => {
          const label = idioma.label.toLowerCase();
          return label.indexOf(needle) > -1;
        });
      });
    },
    async getBlogId() {
      let response = await axios({
        method: "GET",
        url: "https://www.googleapis.com/blogger/v3/users/self/blogs",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess")
        }
      });

      return response.data.items[0].id;
    },
    async createPost(post) {
      const idBlog = await this.getBlogId();
      const url = `https://www.googleapis.com/blogger/v3/blogs/${idBlog}/posts/`;
      const toJSON = JSON.stringify({
        kind: "blogger#post",
        blog: {
          id: idBlog
        },
        title: post.title,
        content: post.content,
        labels: post.labels
      });

      await axios({
        method: "POST",
        url: url,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess"),
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        data: toJSON
      });
    },
    async getLanguages() {
      let response = await axios({
        method: "POST",
        url: "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: JSON.stringify({
          MethodName: "languages",
          params: ""
        })
      });

      return response;
    },
    async translate(source, target, text) {
      let response = await axios({
        method: "POST",
        url: "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: JSON.stringify({
          MethodName: "translate",
          params: {
            source: source,
            target: target,
            text: text
          }
        })
      });

      return response;
    },
    async saveWork() {
      const tagIdiomesSeleccionat = [
        this.selectIdiomes[0].value,
        this.selectIdiomes[1].value
      ];
      if (this.titolPost != "" || this.descripcioPost != "") {
        console.log("Esta buits!!");
        await this.createPost(
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
      console.log(codeIdiomaOriginal, codeIdiomaATraduir);

      //Traduim el titol i el content del post
      const titolTraduit = await this.translate(
        codeIdiomaOriginal,
        codeIdiomaATraduir,
        this.titolPost
      );
      const cosTraduit = await this.translate(
        codeIdiomaOriginal,
        codeIdiomaATraduir,
        this.descripcioPost
      );

      this.titolPost = titolTraduit.data;
      this.descripcioPost = cosTraduit.data;
    },
    async createCameraElement() {
      if (navigator.mediaDevices) {
        let constraintsAudio = {
          audio: true
        };

        let constraintsVideo = {
          audio: false,
          video: {
            width: {
              min: 640
            },
            height: {
              min: 480
            }
          }
        };

        navigator.mediaDevices.getUserMedia(constraintsVideo).then(stream => {
          this.$refs.camera.srcObject = stream;
        });

        const recorder = await navigator.mediaDevices.getUserMedia(
          constraintsAudio
        );
        this.mediaRecorder = new MediaRecorder(recorder);
      }
    },
    recordAudio: function() {
      this.mediaRecorder.start();
      console.log(this.mediaRecorder);
      console.log("recorder started");
    },
    stopAudio: async function() {
      this.mediaRecorder.stop();
      console.log(this.mediaRecorder);
    },
    uploadAudio: async function(blob) {
      let apiUrl = "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php";

      //Cream el formData amb les caracteristiques que es demana
      let formData = new FormData();
      formData.append("arxiu", blob);
      formData.append("MethodName", "transcribe_sync");
      formData.append("params", "{}");

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData
      });

      const responseJSON = await response.json();

      return responseJSON;
    },
    loadAudio: function() {
      //let chunks = [];
      this.mediaRecorder.onstop = this.onStop;

      //Quan estigui gravant, anirem fent push dels chunks
      this.mediaRecorder.ondataavailable = this.ondataavailable;
    },
    onStop: async function(e) {
      console.log("recorder stopped");

      let blob = new Blob(this.chunksAudio, {
        type: "audio/webm; codecs=opus"
      });
      this.chunksAudio = [];
      console.log(blob);
      const transcripcioServidor = await this.uploadAudio(blob);
      console.log(transcripcioServidor);
      if (transcripcioServidor[0].confianca > 0.7) {
        if (this.selectIdiomes) {
          const codeIdiomaOriginal = "es";
          const codeIdiomaATraduir = this.selectIdiomes[1].value;

          const cosTraduit = await this.translate(
            codeIdiomaOriginal,
            codeIdiomaATraduir,
            transcripcioServidor[0].transcripcio
          );
          this.descripcioPost = cosTraduit.data;
        } else {
          this.descripcioPost = transcripcioServidor[0].transcripcio;
        }
      }
    },
    ondataavailable: function(e) {
      console.log(e.data);
      this.chunksAudio.push(e.data);
    }
  },
  async mounted() {
    const allLanguages = await this.getLanguages();
    allLanguages.data.forEach(language => {
      let obj = {
        //code, name
        label: language.name,
        value: language.code
      };
      this.idiomes.push(obj);
    });
    this.idiomesFilter = this.idiomes;
    await this.createCameraElement();
    await this.loadAudio();
  }
};
</script>