#include "./include/json2.js"

var savePath = '~/PS Dev/Action Target';

function main()
{
    var docs = app.documents,
        alertText = ''.concat('Current open documents', "\n"),
        test = {"a": "alabala", "bool": true},
        doc;
        
    alertText += JSON.stringify(test) + "\n";
        
    for (var i = 0; i < docs.length; i++)
    {
        doc = docs[i];
        app.activeDocument = doc;
        alertText = ''.concat(alertText, doc.name, "\n");
        //saveJpeg(doc);
    }
    
    alert(alertText);    
}

function saveJpeg(doc)
{
    var saveName = doc.name.split('.')[0],
        file = new File(savePath + '/' + saveName + '.jpg'),
        opts = new JPEGSaveOptions();
        
    opts.quality = 10;
    doc.saveAs(file, opts, true, Extension.LOWERCASE);
}
main();