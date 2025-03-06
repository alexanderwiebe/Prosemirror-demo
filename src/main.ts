import { exampleSetup } from "prosemirror-example-setup";
import { DOMParser, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "./style.css";

function isIndexWithinRange(from: number, to: number, index: number): boolean {
  return (index >= from && index <= to) || (from === to && index === from);
}

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
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
    },
  },
});

const debugPosition = new Plugin({
  state: {
    init(config, instance) {
      return {};
    },
    apply(tr, value, oldState, newState) {
      const { from, to } = newState.selection;
      document.querySelector(
        "#cursorPosition"
      )!.textContent = `Cursor position: from ${from} to ${to}`;

      const posIndexRow = document.querySelector("#posIndex");
      const posValueRow = document.querySelector("#posValue");
      if (posIndexRow && posValueRow) {
        posIndexRow.innerHTML = "";
        posValueRow.innerHTML = "";
      }
      newState.doc.descendants((node, pos) => {
        if (node.type.name === "text") {
          node.textContent.split("").forEach((char, index, { length }) => {
            const tdIndex = document.createElement("td");
            tdIndex.textContent = (pos + index).toString();

            const tdValue = document.createElement("td");
            tdValue.textContent = char;

            if (isIndexWithinRange(from, to, pos + index)) {
              tdIndex.style.backgroundColor = "yellow";
              tdValue.style.backgroundColor = "yellow";
            }

            posIndexRow?.appendChild(tdIndex);
            posValueRow?.appendChild(tdValue);
            if (index === length - 1) {
              const tdIndex = document.createElement("td");
              tdIndex.textContent = (pos + index + 1).toString();

              const tdValue = document.createElement("td");
              tdValue.textContent = `␣`;

              if (isIndexWithinRange(from, to, pos + index + 1)) {
                tdIndex.style.backgroundColor = "yellow";
                tdValue.style.backgroundColor = "yellow";
              }

              posIndexRow?.appendChild(tdIndex);
              posValueRow?.appendChild(tdValue);
            }
          });
        } else {
          const tdIndex = document.createElement("td");
          tdIndex.textContent = pos.toString();

          const tdValue = document.createElement("td");
          tdValue.textContent = node.type.name;

          if (isIndexWithinRange(from, to, pos)) {
            tdIndex.style.backgroundColor = "yellow";
            tdValue.style.backgroundColor = "yellow";
          }

          posIndexRow?.appendChild(tdIndex);
          posValueRow?.appendChild(tdValue);
        }

        return true; // Continue traversing
      });
      document.querySelector("#prosemirrorJson")!.textContent = JSON.stringify(
        newState.toJSON(),
        null,
        2
      );

      return value;
    },
  },
});

const view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector("#content")!
    ),
    plugins: exampleSetup({ schema: mySchema }).concat([
      myPlugin,
      debugPosition,
    ]),
  }),
});

const insertTransaction1 = view.state.tr.insertText("aaaaa", 0);
view.dispatch(insertTransaction1);

const insertTransaction = view.state.tr.insertText("**", 0);
view.dispatch(insertTransaction);

const insertTransaction2 = view.state.tr.insertText("bbbbb", 0);
view.dispatch(insertTransaction2);

const insertTransaction3 = view.state.tr.insertText("ccccc", 0);
view.dispatch(insertTransaction3);
