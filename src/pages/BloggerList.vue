<template>
  <div class="q-pa-md">
    <q-table title="Treats" :data="data" :columns="columns" row-key="name">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense round flat color="grey" @click="editRow(props)" icon="edit"></q-btn>
          <q-btn dense round flat color="grey" @click="deleteRow(props)" icon="delete"></q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script>
import { getBlogId, getPost, deletePost } from "../boot/servei/postServei.js";
export default {
  data() {
    return {
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
          label: "Calories",
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
    deleteRow(props) {
      alert("Elimina!!");
    }
  },
  async mounted() {
    let blogId = await getBlogId();
    let posts = await getPost(blogId);
    //console.log(posts);
    posts.map(post => {
      console.log(post);
      let objecteAfegir = {
        name: post.title,
        idiomaOriginal: post.labels[0],
        idiomaTraduit: post.labels[1]
      };

      this.data.push(objecteAfegir);
    });
  }
};
</script>