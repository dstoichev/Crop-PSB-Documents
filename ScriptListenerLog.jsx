// =======================================================
var idOpn = charIDToTypeID( "Opn " );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    desc1.putPath( idnull, new File( "/Users/administrator/PS Dev/Action Sources/R_D_Test_01.psb" ) );
executeAction( idOpn, desc1, DialogModes.NO );

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc2 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idnull, ref1 );
    var idT = charIDToTypeID( "T   " );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref2.putProperty( idChnl, idfsel );
    desc2.putReference( idT, ref2 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc2.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc2.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc2, DialogModes.NO );

// =======================================================
var idInvs = charIDToTypeID( "Invs" );
executeAction( idInvs, undefined, DialogModes.NO );

// =======================================================
var idCpyM = charIDToTypeID( "CpyM" );
executeAction( idCpyM, undefined, DialogModes.NO );

/////////////////////////////////////////////////////////////////////

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref2.putEnumerated( idChnl, idChnl, idMsk );
    desc3.putReference( idnull, ref2 );
    var idT = charIDToTypeID( "T   " );
        var ref3 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref3.putProperty( idChnl, idfsel );
    desc3.putReference( idT, ref3 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc3.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc3.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc3, DialogModes.NO );

// =======================================================
var idInvs = charIDToTypeID( "Invs" );
executeAction( idInvs, undefined, DialogModes.NO );

// =======================================================
var idCpyM = charIDToTypeID( "CpyM" );
executeAction( idCpyM, undefined, DialogModes.NO );

