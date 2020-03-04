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
              @click="dialog = true, propActual = props, editRow()"
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
        }
      }"
              :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
        ['save']
      ]"
            />
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>
<script>

import {
  getBlogId,
  getPost,
  deletePost,
  getLanguages,
  getPostById
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
      data: []
    };
  },
  methods: {
    async editRow() {
      await this.carregaPost(this.propActual.row.id);
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
      
    },
    async carregaPost(idPost) {
      console.log("Entro")
      console.log(idPost)
      const post = await getPostById(idPost);
      this.descripcioPost = post.content;
      this.titolPost = post.title;
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