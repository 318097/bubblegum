const _ = require("lodash");
const { processId } = require("../../utils/common");
const PostModel = require("../post/post.model");
const TagsModel = require("../../modules/tags/tags.model");

// const UserModel = require("../user/user.model");
// const ModulesModel = require("../../modules/modules/modules.model");
// const {
//   generateDefaultTagInfo,
// } = require("../../modules/tags/tags.operations");
// const { generateDefaultUserState } = require("../user/user.utils");

// exports.getDataForCSV = async (req, res) => {
//   const { collectionId } = req.params;
//   const posts = await PostModel.find({
//     collectionId: processId(collectionId),
//   }).lean();

//   const result = posts.map((post) => {
//     const {
//       _id,
//       title,
//       url,
//       tags = [],
//       visible,
//       index,
//       sourceInfo,
//       createdAt,
//       status,
//     } = post;
//     const {
//       collectionName,
//       collectionSize,
//       collectionType,
//       fileName,
//       uploadedFileId,
//     } = sourceInfo || {};
//     return {
//       _id,
//       Title: _.capitalize(title),
//       URL: url,
//       Tags: `${
//         _.isEmpty(tags)
//           ? ""
//           : _.join(
//               _.map(tags, (tag) => _.toUpper(tag)),
//               ","
//             )
//       }`,
//       Visible: visible ? "Yes" : "No",
//       Idx: index,
//       CreatedAtNb: createdAt,
//       status,
//       collectionName,
//       collectionSize,
//       collectionType,
//       fileName,
//       uploadedFileId,
//     };
//   });

//   res.send({ result });
// };

exports.autoGenerateTagsForCollection = async (req, res) => {
  const { collectionId } = req.params;
  const tags = await TagsModel.find({
    moduleId: processId(collectionId),
  }).lean();

  const posts = await PostModel.find({
    collectionId: processId(collectionId),
  });

  const result = [];

  posts.forEach((post) => {
    const newTags = _.map(
      _.filter(tags, (tag) => {
        return _.includes(_.toLower(post.title), _.toLower(tag.label));
      }),
      "value"
    );

    const hasNewTags = _.difference(newTags, post.tags);

    if (hasNewTags.length) {
      const updatedTags = _.uniq([...post.tags, ...newTags]);
      post.tags = updatedTags;
      result.push({ title: post.title, updatedTags, newTags });
      post.save();
    }
  });

  res.send({ result });
};

// exports.generateTagValuesForCollection = async (req, res) => {
//   const { collectionId } = req.params;

//   const tags = await TagsModel.find({
//     moduleId: processId(collectionId),
//   });

//   for (const tag of tags) {
//     await PostModel.updateMany(
//       { collectionId: processId(collectionId), tags: tag.label },
//       { $set: { "tags.$": generateSlugV2(tag.label) } }
//     );

//     tag.value = generateSlugV2(tag.label);
//     tag.save();
//   }

//   const conflicts = [
//     ["NPM package", "npm"],
//     ["Startup", "startupsass"],
//     ["Apps", "app"],
//     ["VS Code extension", "vs_code"],
//     ["Cloud services", "cloud"],
//     ["Learning/knowledge", "knowledge"],
//     ["Job board", "job"],
//     ["Icons", "iconssvg"],
//     ["Stock photos", "stock"],
//     ["Landing page", "landing"],
//     ["UI Library", "ui"],
//   ];

//   for (const [problem, newValue] of conflicts) {
//     await PostModel.updateMany(
//       { collectionId: processId(collectionId), tags: problem },
//       { $set: { "tags.$": generateSlugV2(newValue) } }
//     );
//   }
//   res.send("ok");
// };

// exports.getTagConflictsForCollection = async (req, res) => {
//   const { collectionId } = req.params;

//   const tags = await TagsModel.find({
//     moduleId: processId(collectionId),
//   }).lean();

//   const currentTags = _.map(tags, "value");

//   const allTags = [];
//   const posts = await PostModel.find({
//     collectionId: processId(collectionId),
//   });
//   posts.forEach((post) => {
//     if (!_.isEmpty(post.tags)) {
//       allTags.push(...post.tags);
//     }
//   });
//   const uniqueAllTags = _.uniq(allTags);

//   const conflictedTags = _.filter(
//     uniqueAllTags,
//     (tag) => !_.includes(currentTags, tag)
//   );

//   res.send({ allTags: uniqueAllTags, currentTags, conflictedTags });
// };

// exports.normalizeCollectionsAndTimeline = async (req, res) => {
//   let usersList = await UserModel.find({}).lean();

//   const response = [];
//   const mapping = {
//     notebase: 0,
//     timeline: 0,
//   };

//   usersList.forEach((user) => {
//     const userId = user._id;
//     if (user.notebase) {
//       response.push(
//         ...user.notebase.map(({ tags, ...rest }) => ({
//           ...rest,
//           moduleType: "COLLECTION",
//           source: "NOTEBASE",
//           userId,
//         }))
//       );
//       mapping["notebase"] += user.notebase.length;
//     }
//     if (user.timeline) {
//       response.push(
//         ...user.timeline.map((obj) => ({
//           ...obj,
//           moduleType: "TIMELINE",
//           source: "OCTON",
//           userId,
//         }))
//       );
//       mapping["timeline"] += user.timeline.length;
//     }
//   });

//   let dbResponse;
//   dbResponse = await ModulesModel.create(response);
//   res.send({
//     totalUsers: usersList.length,
//     mapping,
//     // response,
//     dbResponse,
//   });
// };

// exports.updateToNewTagsCollection = async (req, res) => {
//   let usersList = await UserModel.find({}).lean();

//   const response = [];
//   const mapping = {
//     expenseTypes: 0,
//     expenseSources: 0,
//     expenseApps: 0,
//     collectionTags: 0,
//   };

//   usersList.forEach((user) => {
//     if (user.expenseTypes) {
//       const newTagsList = user.expenseTypes.map((obj) => {
//         const newTag = generateDefaultTagInfo({
//           obj,
//           user,
//           source: "OCTON",
//           moduleName: "EXPENSE_TYPES",
//         });

//         return newTag;
//       });
//       response.push(...newTagsList);
//       mapping.expenseTypes += newTagsList.length;
//     }

//     if (user.expenseSources) {
//       const newTagsList = user.expenseSources.map((obj) => {
//         const newTag = generateDefaultTagInfo({
//           obj,
//           user,
//           source: "OCTON",
//           moduleName: "EXPENSE_SOURCES",
//         });

//         return newTag;
//       });
//       response.push(...newTagsList);
//       mapping.expenseSources += newTagsList.length;
//     }

//     if (user.expenseApps) {
//       const newTagsList = user.expenseApps.map((obj) => {
//         const newTag = generateDefaultTagInfo({
//           obj,
//           user,
//           source: "OCTON",
//           moduleName: "EXPENSE_APPS",
//         });

//         return newTag;
//       });
//       response.push(...newTagsList);
//       mapping.expenseApps += newTagsList.length;
//     }

//     if (user.notebase) {
//       user.notebase.forEach((collection) => {
//         const newTagsList = collection.tags.map((tag) => {
//           const newTag = generateDefaultTagInfo({
//             obj: tag,
//             user,
//             source: "NOTEBASE",
//             moduleName: "COLLECTION",
//             moduleId: collection._id,
//             deleted: false,
//             visible: true,
//           });

//           return newTag;
//         });

//         response.push(...newTagsList);
//         mapping.collectionTags += newTagsList.length;
//       });
//     }
//   });
//   let dbResponse;
//   dbResponse = await TagsModel.create(response);
//   res.send({
//     totalUsers: usersList.length,
//     mapping,
//     totalTags: dbResponse.length,
//     dbResponse,
//   });
// };

// exports.encryptPasswords = async (req, res) => {
//   const users = await UserModel.find({});

//   users.forEach(async (item) => {
//     // const salt = bcrypt.genSaltSync(10);
//     // const password = bcrypt.hashSync(item.password, salt);
//     const { timeline, expenseTypes, ...rest } = generateDefaultUserState({
//       source: "MIGRATION",
//     });
//     await UserModel.updateOne(
//       { _id: processId(item._id) },
//       {
//         $set: {
//           // password,
//           // originalPassword: item.password,
//           timeline: _.isEmpty(item.timeline) ? timeline : item.timeline,
//           expenseTypes: _.isEmpty(item.expenseTypes)
//             ? expenseTypes
//             : item.expenseTypes,
//           ...rest,
//         },
//       }
//     );
//   });

//   res.send("ok");
// };
