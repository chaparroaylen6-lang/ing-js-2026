if (!window.indexedDB) {
    console.log("Su navegador no soporta una versión estable de indexedDB.");
} else {
    var MotorBD = window.indexedDB;
    var BD = null; 
    init();
}

function init() {
    mostrardiv(false);
    cargarbase();
    document.getElementById("btnadd").addEventListener("click", function() { mostrardiv(true); });
    document.getElementById("btngrabar").addEventListener("click", function() { validar(); });
    document.getElementById("btncancelar").addEventListener("click", function() { mostrardiv(false); });
}

function cargarbase() {

    var request = MotorBD.open("bdautos", 1); 

    request.onupgradeneeded = function (e) {
        var db = e.target.result;
        
        if (!db.objectStoreNames.contains("autos")) {
            db.createObjectStore("autos", { keyPath: 'id', autoIncrement: true });
        }
    };
    
    request.onsuccess = function (e) {
        
        BD = e.target.result; 
        listar();
    };
    
    request.onerror = function (e) {
        alert('Error cargando la base de datos');
    };
}

function mostrardiv(escarga) {
    if (escarga) {
        document.getElementById("titulo").innerHTML = "Nuevo Coche";
        document.getElementById("id").value = "";
        document.getElementById("marca").value = "";
        document.getElementById("modelo").value = "";
        document.getElementById("ano").value = "";
        document.getElementById("combustible").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("divform").hidden = false;
        document.getElementById("divlista").hidden = true;
    } else {
        document.getElementById("divform").hidden = true;
        document.getElementById("divlista").hidden = false;
    }
}

function validar() {
    var xid = document.getElementById("id");
    var marca = document.getElementById("marca");
    var modelo = document.getElementById("modelo");
    var ano = document.getElementById("ano");
    var combustible = document.getElementById("combustible");
    var precio = document.getElementById("precio");
    
    if (marca.value == "" || modelo.value == "" || ano.value == "" || combustible.value == "" || precio.value == "") {
        alert("¡Todos los datos deben ser completados!");
        return false;
    }
    
    var datos = BD.transaction(["autos"], "readwrite"); 
    var autos = datos.objectStore("autos");
    var mensaje = ""; 
    
    
    if (xid.value !== "") { 
        var request = autos.get(parseInt(xid.value));
        request.onsuccess = function(e) {
            
            var data = e.target.result; 
            data.marca = marca.value;
            data.modelo = modelo.value;
            data.ano = ano.value;
            data.combustible = combustible.value;
            data.precio = precio.value;
            
            var requestUpdate = autos.put(data);
            requestUpdate.onerror = function(e) {
                mensaje = 'No se pudo actualizar';
            };
            requestUpdate.onsuccess = function(e) {
                mensaje = 'Vehículo actualizado correctamente';
            };
        };
    } else {
        var requestPut = autos.put({
            marca: marca.value,
            modelo: modelo.value,
            ano: ano.value,
            combustible: combustible.value,
            precio: precio.value
        });
        requestPut.onerror = function (e) {
            mensaje = requestPut.error.name + '\n\n' + requestPut.error.message;
        };
        requestPut.onsuccess = function(e) {
            mensaje = 'Vehículo agregado correctamente';
        };
    }
    
    
    datos.oncomplete = function (e) {
        xid.value = '';
        marca.value = '';
        modelo.value = '';
        ano.value = '';
        combustible.value = '';
        precio.value = '';
        if(mensaje) alert(mensaje);
        mostrardiv(false);
        listar();
    };
}

function borrar(id) {
    var rta = confirm("¿Confirma borrar este registro?");
    if (rta) {
        var requestB = BD.transaction(["autos"], "readwrite")
            .objectStore("autos")
            .delete(id);
            
        requestB.onerror = function (e) {
            alert(requestB.error.name + '\n\n' + requestB.error.message);
        };
        requestB.onsuccess = function (event) {
            listar();
        };
    }
}

function editar(id) {
    mostrardiv(true);
    document.getElementById("titulo").innerHTML = "Edición de Coche";
    
    var datos = BD.transaction(["autos"], "readonly");
    var autos = datos.objectStore("autos");
    var request = autos.get(parseInt(id)); 
    
    request.onsuccess = function (e) {
        var a = e.target.result;
        if (a !== undefined) {
            document.getElementById("id").value = a.id;
            document.getElementById("marca").value = a.marca;
            document.getElementById("modelo").value = a.modelo;
            document.getElementById("ano").value = a.ano;
            document.getElementById("combustible").value = a.combustible;
            document.getElementById("precio").value = a.precio;
        }
    };
}

function listar() {
    var datos = BD.transaction(["autos"], "readonly");
    var autos = datos.objectStore("autos");
    var listaautos = [];
    
    autos.openCursor().onsuccess = function (e) {
        var elementos = e.target.result;
        if (elementos === null) {
            return;
        }
        listaautos.push(elementos.value);
        elementos.continue();
    };
    
    datos.oncomplete = function () {
        var HTML = '';
        
        
        if (listaautos.length === 0) {
            HTML = '<tr><td colspan="6" style="text-align: center;">No hay autos que mostrar</td></tr>';
        } else {
            for (var i = 0; i < listaautos.length; i++) {
                HTML += '<tr>' +
                    '<td>' + listaautos[i].marca + '</td>' +
                    '<td>' + listaautos[i].modelo + '</td>' +
                    '<td>' + listaautos[i].ano + '</td>' +
                    '<td>' + listaautos[i].combustible + '</td>' +
                    '<td>' + listaautos[i].precio + '</td>' +
                    '<td>' +
                    '<button type="button" onclick="editar(' + listaautos[i].id + ')">Editar</button> ' +
                    '<button type="button" onclick="borrar(' + listaautos[i].id + ')">Borrar</button>' +
                    '</td>' +
                    '</tr>';
            }
        }
        document.getElementById("listado").innerHTML = HTML;
    };
}