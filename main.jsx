#include "./include/json2.js"

var savePath = '~/PS Dev/Action Target',
    cropLayerName = 'CROP';

function main()
{
    var docs = app.documents,
        alertText = ''.concat('Current open documents', "\n"),
        doc, cropLayerReference, corner;
        
    for (var i = 0; i < docs.length; i++)
    {
        doc = docs[i];
        app.activeDocument = doc;
        cropLayerReference = doc.artLayers.getByName(cropLayerName);
        doc.activeLayer = cropLayerReference;
        
        addMaskToSelection();
        /*
        doc.selection.select(cropLayerReference.bounds, Selection.EXTEND);
        doc.selection.invert();
        doc.selection.copy(true);
        */
        for (var j = 0; j < 4; j++)
        {
            corner = doc.selection.bounds[j];
            alertText = ''.concat(alertText, corner[0], ' ', corner[1],  "\n");
        }
        alertText = ''.concat(alertText, doc.name, "\n\n");
        //saveJpeg(doc);
    }
    
    alert(alertText);    
}

function addMaskToSelection()
{
    var idAdd = charIDToTypeID( "Add " ),
        desc3 = new ActionDescriptor(),
        idnull = charIDToTypeID( "null" ),
        ref2 = new ActionReference(),
        idChnl = charIDToTypeID( "Chnl" ),
        idMsk = charIDToTypeID( "Msk " );
    
    ref2.putEnumerated( idChnl, idChnl, idMsk );
    desc3.putReference( idnull, ref2 );
    
    var idT = charIDToTypeID( "T   " ),
        ref3 = new ActionReference(),
        idfsel = charIDToTypeID( "fsel" );
    
    ref3.putProperty( idChnl, idfsel );
    desc3.putReference( idT, ref3 );
    
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc3.putInteger( idVrsn, 1 );
    
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc3.putBoolean( idmaskParameters, true );
    
    executeAction( idAdd, desc3, DialogModes.NO );
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