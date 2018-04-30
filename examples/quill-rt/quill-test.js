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

const element = new QuillDocumentElement();

const adapter = new QuillAdapter(quillEditor, element);
