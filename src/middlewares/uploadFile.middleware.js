const multer = require('multer')

// configurar multer. Usamos diskStorage para almacenar los archivos en el disco
// destination debe ser una función que recibe req (request), file (archivo luego de ser procesado por multer) y cb (callback que debe llamarse para indicar el directorio del archivo)
// filename, debe ser una función similar a la anterior, pero nos permitirá indicar el nombre del archivo cuando se haya cargado
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "profile")
            cb(null, `${__dirname}/../../public/images/profiles`)
        else if (file.fieldname === "product")
            cb(null, `${__dirname}/../../public/images/products`)
        else if (file.fieldname === "comprobante")
            cb(null, `${__dirname}/../../public/documents`)
    },
    filename: function (req, file, cb) {
        const userId = req.params.uid
        if (file.fieldname === "profile")
            cb(null, userId + ' - ' + file.fieldname + ' - ' + file.originalname)
        else if (file.fieldname === "product")
            cb(null, userId + ' - ' + file.fieldname + ' - ' + file.originalname)
        else if (file.fieldname === "comprobante")
            cb(null, userId + ' - ' + file.fieldname + ' - ' + file.originalname)
    }
})

// instanciar el uploader
const uploader = multer({
    storage: storage,
    // fileFilter: (req, file, cb) => {
    //     checkFileType(file, cb);
    // }
})

//funcion de chequeo de tipos de archivos que se soportan
function checkFileType(file, cb) {
    if (file.fieldname === "comprobante") {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) { // check file type to be pdf, doc, or docx
            cb(null, true);
        } else {
            cb(null, false); // else fails
        }
    }
    else if (file.fieldname === "product" || file.fieldname === "profile") {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            fiel.mimetype === 'image/gif'
        ) { // check file type to be png, jpeg, or jpg
            cb(null, true);
        } else {
            cb(null, false); // else fails
        }
    }
}

module.exports = uploader