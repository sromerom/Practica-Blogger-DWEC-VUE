<template>
  <q-page>
    <div class="q-pa-md">
      <q-table
        title="Receptes"
        :data="taulaData"
        :columns="columns"
        row-key="id"
        :filter="taulaFilter"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="taulaFilter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              round
              flat
              color="grey"
              @click="dialog = true, propActual = props, anemEditar()"
              icon="edit"
            ></q-btn>
            <q-btn
              dense
              round
              flat
              color="grey"
              @click="confirm = true, propActual = props"
              icon="delete"
            ></q-btn>
          </q-td>
        </template>
      </q-table>

      <!-- ##### Dialog per eliminar un post#####-->
      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="primary" text-color="white" />
            <span class="q-ml-sm">Estas segur d'esborrar aquest post?</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancela" color="primary" v-close-popup />
            <q-btn flat label="Elimina" color="primary" @click="deleteRow()" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <!-- ##### Dialog actualitzar un post#####-->
      <!-- Components molt parescuts al bloggerForm-->
      <div class="q-pa-md q-gutter-sm">
        <q-dialog
          v-model="dialog"
          persistent
          :maximized="maximizedToggle"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class>
            <q-bar>
              <q-space />

              <q-btn
                dense
                flat
                icon="minimize"
                @click="maximizedToggle = false"
                :disable="!maximizedToggle"
              >
                <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
              </q-btn>
              <q-btn
                dense
                flat
                icon="crop_square"
                @click="maximizedToggle = true"
                :disable="maximizedToggle"
              >
                <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
              </q-btn>
            </q-bar>
            <!-- Començam a carregar la pagina-->
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
                  tip: 'Actualitza el teu post',
                  icon: 'update',
                  label: 'Actualitza post',
                  handler: updateWork
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
                ['save', 'translate']]"
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
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>
<script>
import axios from "axios";
import { Post } from "../boot/post.js";
export default {
  name: "BloggerList",
  data() {
    return {
      blogId: "",
      dialog: false,
      maximizedToggle: true,
      confirm: false,
      propActual: {},
      titolPost: "",
      descripcioPost: "",
      selectIdiomes: null,
      idiomes: [],
      idiomesFilter: [],
      columns: [
        {
          name: "name",
          required: true,
          label: "Títols",
          align: "left",
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: "idiomaOriginal",
          align: "center",
          label: "Idioma Original",
          field: "idiomaOriginal",
          sortable: true
        },
        {
          name: "idiomaTraduit",
          label: "Idioma Traduït",
          field: "idiomaTraduit",
          sortable: true
        },
        { name: "actions", label: "Actions", field: "", align: "center" }
      ],
      taulaData: [],
      taulaFilter: "",
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
    async anemEditar() {
      await this.carregaPost(this.propActual.row.id);
      await this.createCameraElement();
      await this.loadAudio();
    },
    async deleteRow() {
      const idPostActual = this.propActual.row.id;
      await this.deletePost(this.blogId, idPostActual);
      this.taulaData = [];
      await this.loadPosts();
      this.$q.notify({
        type: "negative",
        message: `El post ha sigut eliminat amb exit`
      });
    },
    async loadPosts() {
      this.blogId = await this.getBlogId();
      const posts = await this.getPost(this.blogId);
      posts.map(post => {
        const objecteAfegir = {
          id: post.idPost,
          name: post.title,
          idiomaOriginal: post.labels[0],
          idiomaTraduit: post.labels[1]
        };
        this.taulaData.push(objecteAfegir);
      });
    },
    async updateWork() {
      if (this.titolPost != "" || this.descripcioPost != "") {
        const tagIdiomesSeleccionat = [
          this.selectIdiomes[0].value,
          this.selectIdiomes[1].value
        ];
        const post = await this.getPostById(this.propActual.row.id);
        await this.updatePost(
          new Post(
            post.idPost,
            post.idBlog,
            post.author,
            post.published,
            undefined,
            post.url,
            this.titolPost,
            this.descripcioPost,
            tagIdiomesSeleccionat
          )
        );
      } else {
        this.$q.notify({
          type: "info",
          message: `Omple tots els camps necessaris`
        });
      }
      this.taulaData = [];
      await this.loadPosts();
      this.$q.notify({
        type: "warning",
        message: `S'ha modificat correctament el post`
      });
    },
    async carregaPost(idPost) {
      const post = await this.getPostById(idPost);

      const contentTraduit = await this.translate(
        post.labels[1],
        post.labels[0],
        post.content
      );
      const titleTraduit = await this.translate(
        post.labels[1],
        post.labels[0],
        post.title
      );

      this.descripcioPost = contentTraduit.data;
      this.titolPost = titleTraduit.data;

      /*
      let labelIdiomaElegits = [];
      this.idiomes.forEach(idioma => {
        if (
          idioma.value === post.labels[0] ||
          idioma.value === post.labels[1]
        ) {
          labelIdiomaElegits.push(idioma.label);
        }
      });

      */
      this.selectIdiomes = [
        {
          label: post.labels[0],
          value: post.labels[0]
        },
        {
          label: post.labels[1],
          value: post.labels[1]
        }
      ];
    },
    async translateIt() {
      const codeIdiomaOriginal = this.selectIdiomes[0].value;
      const codeIdiomaATraduir = this.selectIdiomes[1].value;

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
    }, //media recorder
    recordAudio: function() {
      this.mediaRecorder.start();
      console.log("recorder started");
    },
    stopAudio: async function() {
      this.mediaRecorder.stop();
    },
    uploadAudio: async function(blob) {
      let apiUrl = "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php";

      //Cream el formData amb les caracteristiques que es demana
      let formData = new FormData();
      formData.append("arxiu", blob);
      formData.append("MethodName", "transcribe_sync");
      formData.append("params", "{}");

      const response = await axios({
        method: "POST",
        url: apiUrl,
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: formData
      });

      return response.data;
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
      const transcripcioServidor = await this.uploadAudio(blob);
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
      this.chunksAudio.push(e.data);
    }, //A partir d'aqui tots el metode que fan servir axios
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
    async getPost(blogId) {
      const url =
        "https://www.googleapis.com/blogger/v3/blogs/" + blogId + "/posts";

      let response = await axios({
        method: "GET",
        url: url,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess")
        }
      });

      let fetchToObject = response.data.items.map(post => {
        return new Post(
          post.id,
          post.blog.id,
          post.author,
          post.published,
          post.updated,
          post.url,
          post.title,
          post.content,
          post.labels
        );
      });

      return fetchToObject;
    },
    async updatePost(post) {
      const url = `https://www.googleapis.com/blogger/v3/blogs/${post.idBlog}/posts/${post.idPost}`;

      const toJSON = JSON.stringify({
        id: post.idPost,
        kind: "blogger#post",
        blog: {
          id: post.idBlog
        },
        author: post.author,
        published: post.published,
        url: post.url,
        selfLink: url,
        title: post.title,
        content: post.content,
        labels: post.labels
      });

      await axios({
        method: "PUT",
        url: url,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess"),
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        data: toJSON
      });
    },
    async deletePost(idBlog, idPost) {
      const url = `https://www.googleapis.com/blogger/v3/blogs/${idBlog}/posts/${idPost}`;

      await axios({
        method: "DELETE",
        url: url,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess"),
          Accept: "application/json",
          "Content-Type": "application/json"
        }
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
    async getPostById(postId) {
      const idBlog = await this.getBlogId();
      const url = `https://www.googleapis.com/blogger/v3/blogs/${idBlog}/posts/${postId}`;

      let response = await axios({
        method: "GET",
        url: url,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tokenAccess")
        }
      });

      return new Post(
        response.data.id,
        response.data.blog.id,
        response.data.author,
        response.data.published,
        response.data.updated,
        response.data.url,
        response.data.title,
        response.data.content,
        response.data.labels
      );
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
    }
  },
  async mounted() {
    //Cargam el posts
    await this.loadPosts();

    //Cargam els idiomes del input
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
  }
};
</script>