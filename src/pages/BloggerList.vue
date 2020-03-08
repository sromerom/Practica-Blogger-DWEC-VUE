<template>
  <q-page>
    <div class="q-pa-md">
      <q-table title="Receptes" :data="data" :columns="columns" row-key="id">
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
            <p>{{selectIdiomes}}</p>
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
import { Post } from "../boot/post.js";
import {
  getBlogId,
  getPost,
  updatePost,
  deletePost,
  getLanguages,
  getPostById,
  translate
} from "../boot/postServei.js";
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
      data: [],
      mediaRecorder: "",
      chunksAudio: []
    };
  },
  methods: {
    async anemEditar() {
      await this.carregaPost(this.propActual.row.id);
      await this.createCameraElement();
      await this.loadAudio();
    },
    async deleteRow() {
      const idPostActual = this.propActual.row.id;
      await deletePost(this.blogId, idPostActual);
      //Esta bien?
      this.data = [];
      await this.loadPosts();
      this.$q.notify({
        type: "negative",
        message: `El post ha sigut eliminat amb exit`
      });
    },
    async loadPosts() {
      this.blogId = await getBlogId();
      const posts = await getPost(this.blogId);
      posts.map(post => {
        const objecteAfegir = {
          id: post.idPost,
          name: post.title,
          idiomaOriginal: post.labels[0],
          idiomaTraduit: post.labels[1]
        };
        this.data.push(objecteAfegir);
      });
    },
    async updateWork() {
      if (this.titolPost != "" || this.descripcioPost != "") {
        const tagIdiomesSeleccionat = [
          this.selectIdiomes[0].value,
          this.selectIdiomes[1].value
        ];
        const post = await getPostById(this.propActual.row.id);
        await updatePost(
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
      }
      this.data = [];
      await this.loadPosts();
      this.$q.notify({
        type: "warning",
        message: `S'ha modificat correctament el post`
      });
    },
    async carregaPost(idPost) {
      console.log("Entro");
      console.log(idPost);
      const post = await getPostById(idPost);

      const contentTraduit = await translate(
        post.labels[1],
        post.labels[0],
        post.content
      );
      const titleTraduit = await translate(
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
      console.log(post);
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
      console.log(this.selectIdiomes);

      const codeIdiomaOriginal = this.selectIdiomes[0].value;
      const codeIdiomaATraduir = this.selectIdiomes[1].value;
      console.log(codeIdiomaOriginal, codeIdiomaATraduir);

      //Traduim el titol i el content del post
      const titolTraduit = await translate(
        codeIdiomaOriginal,
        codeIdiomaATraduir,
        this.titolPost
      );
      const cosTraduit = await translate(
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

          const cosTraduit = await translate(
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
    //Cargam el posts
    await this.loadPosts();

    //Cargam els idiomes del input
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