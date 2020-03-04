<template>
  <div class="q-pa-md">
    <q-table title="Receptes" :data="data" :columns="columns" row-key="id">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat color="grey" @click="editRow(props)" icon="edit"></q-btn>
          <q-btn
            dense
            round
            flat
            color="grey"
            v-on:click="confirm = true, propActual = props"
            icon="delete"
          ></q-btn>
        </q-td>
      </template>
    </q-table>
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
  </div>
</template>
<script>
import { getBlogId, getPost, deletePost } from "../boot/postServei.js";
export default {
  name: "BloggerList",
  data() {
    return {
      blogId: "",
      confirm: false,
      propActual: {},
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
    editRow(props) {
      alert("Edita!!");
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
    }
  },
  async mounted() {
    await this.loadPosts();
  }
};
</script>