///////////////////////////////////////////////////////////////////////////////
// Quill Editor Set Up
///////////////////////////////////////////////////////////////////////////////


const quillEditor = new Quill('#quill-editor', {
  modules: {
    'formula': false,
    'syntax': false,
    'toolbar': [
      [ 'bold', 'italic', 'underline', 'strike' ],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
      [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
      [ 'direction', { 'align': [] }],
      [ 'link', 'image', 'video', 'formula' ],
      [ 'clean' ]
    ],
  },
  theme: 'snow'
});

quillEditor.setContents({
  ops: [
    { insert: 'Gandalf', attributes: { bold: true } },
    { insert: ' the ' },
    { insert: 'Grey', attributes: { color: '#cccccc' } }
  ]
});


const rtDoc = new Convergence.QuillDeltaConverter.deltaToDoc(quillEditor.getContents());
const quillDoc = new Convergence.RealTimeQuillDocument(rtDoc);

const adapter = new QuillAdapter(quillEditor, quillDoc);
