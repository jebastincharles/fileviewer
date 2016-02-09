/*
 Copyright (c) 2016 Dmitry Brant.
 http://dmitrybrant.com

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var ResultNode = function(key, value) {
    this.key = key ? key.toString() : "";
    this.value = value ? value.toString() : "";
    this.nodes = [];

    this.add = function(key, value) {
        var node = new ResultNode(key, value);
        this.nodes.push(node);
        return node;
    }
};

var FileFormat = function() {
    this.ext = arguments[0];
    this.shortDesc = arguments[1];
    this.longDesc = arguments[2];
    this.detectScripts = arguments[3];
    this.detectFunc = arguments[4];
    this.canPreviewNatively = false;
    this.parseFunc = null;
};

var FileFormatList = [

	new FileFormat("jpg",
        "Lossy format widely used for storing photos and images in digital cameras and the web.",
        "",
        [ "tiff.js", "fileJpg.js" ],
        function(reader) {
            if ((reader.byteAt(0) == 0xFF) && (reader.byteAt(1) == 0xD8) && (reader.byteAt(2) == 0xFF)
                && (reader.byteAt(3) == 0xE0 || reader.byteAt(3) == 0xE1 || reader.byteAt(3) == 0xFE)){
                this.canPreviewNatively = true;
                return true;
            }
            return false;
        }),

	new FileFormat("png",
        "Lossless format widely used for storing graphics on the web.",
        "",
        [ "filePng.js" ],
        function(reader) {
            if ((reader.byteAt(0) == 0x89) && (reader.byteAt(1) == 0x50)
                && (reader.byteAt(2) == 0x4E) && (reader.byteAt(3) == 0x47)){
                this.canPreviewNatively = true;
                return true;
            }
            return false;
        }),

    new FileFormat("tiff",
        "Lossless format used by digital cameras for storing raw images.",
        "",
        [ "tiff.js", "fileTiff.js" ],
        function(reader) {
            if ((reader.byteAt(0) == 0x49) && (reader.byteAt(1) == 0x49) && (reader.byteAt(2) == 0x2A) && (reader.byteAt(3) == 0)
                || (reader.byteAt(0) == 0x4D) && (reader.byteAt(1) == 0x4D) && (reader.byteAt(2) == 0) && (reader.byteAt(3) == 0x2A)) {
                return true;
            }
            else if ((reader.byteAt(0) == 0x49) && (reader.byteAt(1) == 0x49) && (reader.byteAt(2) == 0x52) && (reader.byteAt(3) == 0x4F)) {
                return true;
            }
            else if ((reader.byteAt(0) == 0x49) && (reader.byteAt(1) == 0x49) && (reader.byteAt(2) == 0x55) && (reader.byteAt(3) == 0)) {
                return true;
            }
            return false;
        }),

    new FileFormat("ppm",
        "Portable pixel map.",
        "",
        [ "filePnm.js" ],
        function(reader) {
            if ((reader.byteAt(0) == 0x50) && (reader.byteAt(1) >= 0x31) && (reader.byteAt(1) <= 0x36)
                && ((reader.byteAt(2) == 0xA) || (reader.byteAt(2) == 0xD) || (reader.byteAt(2) == 0x20))){
                return true;
            }
            return false;
        }),

    new FileFormat("mov",
        "MP4/M4V/M4A/3GP/MOV audio/video.",
        "",
        [ "fileMov.js" ],
        function(reader) {
            if ((reader.byteAt(4) == 0x66) && (reader.byteAt(5) >= 0x74) && (reader.byteAt(6) <= 0x79) && (reader.byteAt(7) == 0x70)){
                return true;
            }
            return false;
        }),

    new FileFormat("bpg",
        "Better Portable Graphics format.",
        "",
        [ "bpgdec8.js", "fileBpg.js" ],
        function(reader) {
            if ((reader.byteAt(0) == 0x42) && (reader.byteAt(1) >= 0x50) && (reader.byteAt(2) <= 0x47) && (reader.byteAt(3) == 0xFB)){
                return true;
            }
            return false;
        })

];

var UnknownFileFormat = new FileFormat("", "Unknown file type", "", null, function() {
    return true;
});

function detectFileFormat(reader) {
    var detectedFormat = null;
    for (var i = 0; i < FileFormatList.length; i++) {
        if (FileFormatList[i].detectFunc(reader)) {
            detectedFormat = FileFormatList[i];
            break;
        }
    }
    if (detectedFormat === null) {
        detectedFormat = UnknownFileFormat;
    }
    return detectedFormat;
}
