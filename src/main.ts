import './style.css'
import {EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
});

const myPlugin = new Plugin({
  state: {
    init(config, instance) {
      console.log("Plugin initialized");
      return {};
    },
    apply(tr, value, oldState, newState) {
      console.log("Transaction applied");
      return value;
    }
  }
});

const view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")!),
    plugins: exampleSetup({schema: mySchema}).concat(myPlugin)
  })
});

const instertTransaction = view.state.tr.insertText('aaaaa', 0);
console.log(instertTransaction);
view.dispatch(instertTransaction);
const instertTransaction2 = view.state.tr.insertText('bbbbb', 0);
view.dispatch(instertTransaction2);
const instertTransaction3 = view.state.tr.insertText('ccccc', 0);
view.dispatch(instertTransaction3);

console.log(view);