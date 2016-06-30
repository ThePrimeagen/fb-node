'use strict';

const flatbuffers = require('./../flatbuffers.js').flatbuffers;
const NetflixFBS = require('./../test_generated.js').Netflix;

// TODO: implement unique
module.exports = function generate(lolomo, unique) {
    // Convert to fbs.
    const fbb = new flatbuffers.Builder(1);
    const rowIndices = [];
    const rows = lolomo.rows;

    for (let i = 0; i < rows.length; ++i) {
        const row = rows[i];
        const videos = row.videos;
        const vIndices = fillVideos(fbb, videos, unique);
        createRow(fbb, row, vIndices, rowIndices);
    }

    createLolomo(fbb, lolomo, rowIndices);

    return fbb.asUint8Array();
};

function fillVideos(builder, videos) {
    const videoIndices = [];
    for (let i = 0; i < videos.length; ++i) {
        createVideo(builder, videos[i], videoIndices);
    }

    return videoIndices;
}

const Lolomo = NetflixFBS.Lolomo;
function createLolomo(builder, lolomo, listOfRowIndices) {

    const idOffset = builder.createString(lolomo.id);
    const rowsIndex = Lolomo.createRowsVector(builder, listOfRowIndices);

    Lolomo.startLolomo(builder);
    Lolomo.addId(builder, idOffset);
    Lolomo.addRows(builder, rowsIndex);

    const lolomoIndex = Lolomo.endLolomo(builder);
    Lolomo.finishLolomoBuffer(builder, lolomoIndex);
}

const Row = NetflixFBS.Row;
function createRow(builder, row, listOfVideoIndices, listOfRowIndices) {

    const titleOffset = builder.createString(row.title);
    const videosIndex = Row.createVideosVector(builder, listOfVideoIndices);

    Row.startRow(builder);
    Row.addTitle(builder, titleOffset);
    Row.addVideos(builder, videosIndex);

    const nextIndex = Row.endRow(builder);
    listOfRowIndices.push(nextIndex);
}

// Note, we could pack the nonsense out of this by first
// serializing the strings for all unique videos and then
// pointing each copy to each video.
const Video = NetflixFBS.Video;
function createVideo(builder, video, listOfIndices) {

    const titleOffset = builder.createString(video.title);
    const synopsisOffset = builder.createString(video.synopsis);
    const altSynopsisOffset = builder.createString(video.altSynopsis);

    Video.startVideo(builder);
    Video.addId(builder, video.id);
    Video.addTitle(builder, titleOffset);
    Video.addSynopsis(builder, synopsisOffset);
    Video.addAltSynopsis(builder, altSynopsisOffset);
    Video.addOriginal(builder, true);
    Video.addCount(builder, 0);

    const nextIndex = Video.endVideo(builder);
    listOfIndices.push(nextIndex);
}
