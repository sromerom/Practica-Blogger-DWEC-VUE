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
import { getBlogId } from "../boot/postServei.js";
//import { getBlogId, getPost, deletePost } from './servei/postServei.js';
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
    },
    getBlogId() {

    }
  },
  async mounted() {
    let blogId = await getBlogId();
    console.log(blogId);
  }

  /*
  let response = await fetch("https://www.googleapis.com/blogger/v3/users/self/blogs", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("tokenAccess")
        },
    });

    let responseJSON = await response.json();
    return responseJSON.items[0].id;
  */
};
</script>