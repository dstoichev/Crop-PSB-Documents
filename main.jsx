var docs = app.documents,
    alertText = ''.concat('Current open documents', "\n");
    
for (var i = 0; i < docs.length; i++)
{
    alertText = ''.concat(alertText, docs[i].name, "\n");
}

alert(alertText);