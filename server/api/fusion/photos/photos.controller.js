import { processId } from "../../../utils/common.js";
import modelEntityMap from "../models.js";

const getAggregationFiltersPhotos = (req) => {
  const {
    search,
    limit = 250,
    page = 1,
    tags = [],
    status = [],
    visible,
    sortOrder,
    sortFilter,
    type,
    deleted,
  } = req.query;
  const { albumId } = req.params;
  const aggregation = {
    albumId: processId(albumId),
  };
  let sort = {
    _id: -1,
    createdAt: -1,
  };

  return { aggregation, sort, page, limit };
};

async function getAllPhotosByAlbum(req, res) {
  const { aggregation, sort, page, limit } = getAggregationFiltersPhotos(req);

  const photos = await modelEntityMap.photos.aggregate([
    { $match: aggregation },
    { $sort: sort },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    { $limit: Number(limit) },
  ]);

  const count = await modelEntityMap.photos.countDocuments(aggregation);

  res.send({
    photos,
    meta: { count },
  });
}

async function addFilesToAlbum(req, res) {
  const { data } = req.body;
  const { albumId } = req.params;
  const { _id } = req.user;

  const files = [].concat(data).map((file) => {
    return {
      ...file,
      userId: _id,
      albumId,
      uploadedAt: new Date().getTime(),
      // sourceInfo: file.sourceInfo,
    };
  });
  const result = await modelEntityMap.photos.create(files);

  res.send({ result });
}

async function updateFilesInAlbum(req, res) {
  const { userId } = req;
  const { fileIds = [], action, album } = req.body;
  const { albumId } = req.params;

  const updatedData = {};

  if (action) {
    switch (action) {
      case "draft":
      case "published":
      case "archived":
      case "deleted":
      case "private":
        updatedData["state"] = action;
        break;
      case "pin":
        updatedData["pinned"] = true;
        break;
      case "unpin":
        updatedData["pinned"] = false;
        break;
      case "cluster": {
        const newClusterId = (album.clusterId || 0) + 1;
        updatedData["cluster"] = newClusterId;
        modelEntityMap.albums
          .findByIdAndUpdate(albumId, {
            clusterId: newClusterId,
          })
          .exec();
        break;
      }
      default:
        break;
    }
  }

  const query = {
    _id: { $in: fileIds.map((id) => processId(id)) },
    albumId,
    // userId,
  };

  const result = await modelEntityMap.photos.updateMany(
    query,
    { $set: updatedData },
    {
      new: true,
    },
  );

  res.send({ result });
}

export { getAllPhotosByAlbum, addFilesToAlbum, updateFilesInAlbum };
