const _ = require("lodash");
const moment = require("moment");
const { processId } = require("../../utils/common");
const PostModel = require("../post/post.model");
const TagsModel = require("../../modules/tags/tags.model");
const UserModel = require("../user/user.model");
const ExpensesModel = require("../expenses/expenses.model");

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

// Migrated to notion on 19th Dec 2025. No more additions to octon after this.
exports.getOctonExpensesForNotion = async (req, res) => {
  const user = {
    _id: "5d51928bd6e5930004eccb38",
    expenseTypes: [
      {
        _id: "609512195841360004fdfc62",
        deleted: false,
        visible: true,
        label: "Bills",
        createdAt: "2021-05-07T10:10:33.405Z",
        key: "BILLS",
        success: "DOWN",
        color: "orange",
        default: true,
        isRoot: true,
        value: "bills",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: null,
        updatedAt: "2021-05-07T10:10:33.405Z",
        __v: 0,
      },
      {
        _id: "617ecdf2674e9000047a024f",
        deleted: false,
        visible: false,
        label: "Chit fund",
        createdAt: "2021-10-31T17:10:10.099Z",
        value: "chit_fund",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2021-10-31T17:10:10.099Z",
        __v: 0,
      },
      {
        _id: "614467028127f900044bc39e",
        deleted: false,
        visible: false,
        label: "Commission",
        createdAt: "2021-09-17T09:59:30.646Z",
        value: "commission",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512835841360004fdfc64",
        updatedAt: "2021-09-17T09:59:30.646Z",
        __v: 0,
      },
      {
        _id: "61766b7b16759b0004a5ec1b",
        deleted: false,
        visible: false,
        label: "Credit card",
        createdAt: "2021-10-25T08:31:55.258Z",
        value: "credit_card",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        updatedAt: "2021-10-25T08:31:55.258Z",
        __v: 0,
      },
      {
        _id: "60981d72a80b480004dbdb29",
        deleted: false,
        visible: true,
        label: "Crypto",
        createdAt: "2021-05-09T17:35:46.063Z",
        value: "crypto",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2021-05-09T17:35:46.063Z",
        __v: 0,
      },
      {
        _id: "609a8cec669f7a000480c343",
        deleted: false,
        visible: false,
        label: "Electricity",
        createdAt: "2021-05-11T13:55:56.942Z",
        value: "electricity",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        updatedAt: "2021-05-11T13:55:56.942Z",
        __v: 0,
      },
      {
        _id: "679127730e130d0059675376",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        label: "Entertainment/Leisure",
        value: "entertainmentleisure",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2025-01-22T17:14:27.774Z",
        updatedAt: "2025-01-22T17:14:27.774Z",
        __v: 0,
      },
      {
        _id: "6094fcfdcbc4c6000473cf6a",
        deleted: false,
        visible: true,
        label: "Expenses",
        createdAt: "2021-05-07T08:40:29.580Z",
        key: "EXPENSE",
        success: "DOWN",
        color: "watermelon",
        default: true,
        isRoot: true,
        value: "expenses",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: null,
        updatedAt: "2021-05-07T08:40:29.580Z",
        __v: 0,
      },
      {
        _id: "5d519d6b58ae080004982758",
        deleted: false,
        visible: true,
        label: "Food",
        value: "food",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2022-03-19T12:16:18.199Z",
        __v: 0,
      },
      {
        _id: "61fe8e6de6abfc0004f1c141",
        deleted: false,
        visible: false,
        label: "Freelancing",
        createdAt: "2022-02-05T14:49:17.437Z",
        value: "freelancing",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512835841360004fdfc64",
        updatedAt: "2022-02-05T14:49:17.437Z",
        __v: 0,
      },
      {
        _id: "5d519d7b58ae08000498275a",
        deleted: false,
        visible: true,
        label: "Fuel",
        value: "fuel",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2024-12-04T10:49:40.546Z",
        __v: 0,
      },
      {
        _id: "5d519d6058ae080004982757",
        deleted: false,
        visible: true,
        label: "General",
        value: "general",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        createdAt: "2022-03-19T12:16:18.198Z",
        updatedAt: "2022-03-19T12:16:18.198Z",
        __v: 0,
      },
      {
        _id: "6500339bac6c90003f622c01",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        label: "Harsh Loan",
        parentTagId: "609512195841360004fdfc62",
        value: "harsh_loan",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-09-12T09:47:07.115Z",
        updatedAt: "2023-09-12T09:47:07.115Z",
        __v: 0,
      },
      {
        _id: "64e09129f4dda3003f2f60eb",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        label: "Home construction",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        value: "home_construction",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-08-19T09:53:45.565Z",
        updatedAt: "2023-08-19T09:53:45.565Z",
        __v: 0,
      },
      {
        _id: "60c6e8f290a10700047f1fbb",
        deleted: false,
        visible: true,
        label: "Home/Grocery/Outings",
        createdAt: "2021-06-14T05:28:18.202Z",
        value: "home",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        updatedAt: "2025-01-22T17:13:46.658Z",
        __v: 0,
        canDelete: true,
      },
      {
        _id: "5f7be31cbcdf860004d7fbdd",
        deleted: false,
        visible: true,
        label: "House Rent",
        value: "rent",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2025-01-22T17:13:14.047Z",
        __v: 0,
        canDelete: true,
      },
      {
        _id: "633e899f0bbbbc00044c853b",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        label: "Immigration",
        parentTagId: "633e89880bbbbc00044c853a",
        value: "immigration",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2022-10-06T07:54:07.949Z",
        updatedAt: "2022-10-06T07:54:07.949Z",
        __v: 0,
      },
      {
        _id: "609512835841360004fdfc64",
        deleted: false,
        visible: false,
        label: "Income",
        createdAt: "2021-05-07T10:12:19.832Z",
        key: "INCOME",
        success: "UP",
        color: "orchid",
        default: true,
        isRoot: true,
        value: "income",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: null,
        updatedAt: "2021-05-07T10:12:19.832Z",
        __v: 0,
      },
      {
        _id: "61fe8e59e6abfc0004f1c140",
        deleted: false,
        visible: true,
        label: "Insurance",
        createdAt: "2022-02-05T14:48:57.335Z",
        value: "insurance",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2022-02-05T14:48:57.335Z",
        __v: 0,
      },
      {
        _id: "609512795841360004fdfc63",
        deleted: false,
        visible: true,
        label: "Investments",
        createdAt: "2021-05-07T10:12:09.646Z",
        key: "INVESTMENT",
        success: "UP",
        color: "green",
        default: true,
        isRoot: true,
        value: "investments",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: null,
        updatedAt: "2021-05-07T10:12:09.646Z",
        __v: 0,
      },
      {
        _id: "60acedc45bd7b00004fb0282",
        deleted: false,
        visible: true,
        label: "Mutual Fund",
        createdAt: "2021-05-25T12:29:56.337Z",
        value: "mf",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2021-05-25T12:29:56.337Z",
        __v: 0,
      },
      {
        _id: "622a37702d7c9c0004bdd602",
        deleted: false,
        visible: true,
        label: "NPS",
        createdAt: "2022-03-10T17:37:52.688Z",
        value: "nps",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2022-03-10T17:37:52.688Z",
        __v: 0,
      },
      {
        _id: "62bc5a2cb061480004ebd723",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        label: "Others",
        value: "others",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2022-06-29T13:57:00.681Z",
        updatedAt: "2022-06-29T13:57:00.681Z",
        __v: 0,
      },
      {
        _id: "5f82dc5e1e9e7b000494eb66",
        deleted: false,
        visible: true,
        label: "Payments",
        value: "payments",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2022-03-19T12:16:18.199Z",
        __v: 0,
      },
      {
        _id: "60981ccea80b480004dbdb24",
        deleted: false,
        visible: false,
        label: "Pesto",
        createdAt: "2021-05-09T17:33:02.896Z",
        value: "pesto",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        updatedAt: "2021-05-09T17:33:02.896Z",
        __v: 0,
      },
      {
        _id: "61a4e027489dd90004b88ab7",
        deleted: false,
        visible: true,
        label: "Phone/Internet Recharge",
        createdAt: "2021-11-29T14:13:59.252Z",
        value: "phone/internet",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512195841360004fdfc62",
        updatedAt: "2025-01-22T17:13:02.057Z",
        __v: 0,
        canDelete: true,
      },
      {
        _id: "5d519d7258ae080004982759",
        deleted: false,
        visible: true,
        label: "Shopping",
        value: "shopping",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2022-03-19T12:16:18.199Z",
        __v: 0,
      },
      {
        _id: "5d519d8158ae08000498275b",
        deleted: false,
        visible: true,
        label: "Snacks",
        value: "snacks",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        createdAt: "2022-03-19T12:16:18.199Z",
        updatedAt: "2022-03-19T12:16:18.199Z",
        __v: 0,
      },
      {
        _id: "60981d63a80b480004dbdb28",
        deleted: false,
        visible: false,
        label: "Spenny",
        createdAt: "2021-05-09T17:35:31.216Z",
        value: "spenny",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2021-05-09T17:35:31.216Z",
        __v: 0,
      },
      {
        _id: "60981d95a80b480004dbdb2a",
        deleted: false,
        visible: true,
        label: "Stocks",
        createdAt: "2021-05-09T17:36:21.232Z",
        value: "shares",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2021-05-09T17:36:21.232Z",
        __v: 0,
      },
      {
        _id: "642043db9f1fae004050719a",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        label: "Subscriptions",
        parentTagId: "609512195841360004fdfc62",
        value: "subscriptions",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-03-26T13:08:43.591Z",
        updatedAt: "2023-03-26T13:08:43.591Z",
        __v: 0,
      },
      {
        _id: "64c013276d3efe003eb033ca",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_TYPES",
        label: "Transport",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        value: "transport",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-07-25T18:23:35.603Z",
        updatedAt: "2023-07-25T18:23:35.603Z",
        __v: 0,
      },
      {
        _id: "6268c71cbc5cfa0004f5833f",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_TYPES",
        label: "Trips",
        parentTagId: "6094fcfdcbc4c6000473cf6a",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2022-04-27T04:31:24.499Z",
        updatedAt: "2022-04-27T04:31:24.499Z",
        __v: 0,
      },
      {
        _id: "60c6d90d9e5734000469a1bb",
        deleted: false,
        visible: false,
        label: "US Stocks",
        createdAt: "2021-06-14T04:20:29.974Z",
        value: "us_shares",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_TYPES",
        parentTagId: "609512795841360004fdfc63",
        updatedAt: "2025-12-19T15:32:44.991Z",
        __v: 0,
      },
    ],
    expenseGroups: [
      {
        _id: "63bbc188cb0a6967e2f582a7",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "BuildCamps Goa '22",
        value: "buildcamps_goa_22",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-01-09T07:26:00.131Z",
        updatedAt: "2023-01-09T07:26:00.131Z",
        __v: 0,
      },
      {
        _id: "675034e7a715f900502b1d2d",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "Chickmagalur '24",
        value: "chickmagalur_24",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2024-12-04T10:54:31.246Z",
        updatedAt: "2024-12-04T12:40:14.249Z",
        __v: 0,
      },
      {
        _id: "67a5886e5de488005a5813ed",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "Dubai '25",
        value: "dubai_25",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2025-02-07T04:13:34.569Z",
        updatedAt: "2025-11-11T14:29:13.678Z",
        __v: 0,
      },
      {
        _id: "667d030e9c7fa500506c0527",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "Gems Bday '24",
        value: "gems_bday_24",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2024-06-27T06:13:34.530Z",
        updatedAt: "2024-07-06T13:54:15.677Z",
        __v: 0,
      },
      {
        _id: "664cbd9af4a195004069e308",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "GrandPaw '24",
        value: "grandpaw_24",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2024-05-21T15:28:26.759Z",
        updatedAt: "2024-07-06T13:54:26.074Z",
        __v: 0,
      },
      {
        _id: "633e89880bbbbc00044c853a",
        deleted: false,
        visible: false,
        moduleName: "EXPENSE_GROUPS",
        label: "UK",
        value: "uk",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2022-10-06T07:53:44.473Z",
        updatedAt: "2022-10-06T07:53:44.473Z",
        __v: 0,
      },
    ],
    expenseSources: [
      {
        _id: "61d2b3d69e91750004082f9f",
        deleted: false,
        visible: true,
        label: "Cash",
        createdAt: "2022-01-03T08:29:10.971Z",
        value: "cash",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:29:10.971Z",
        __v: 0,
      },
      {
        _id: "61d2b3909e91750004082f99",
        deleted: false,
        visible: true,
        label: "HDFC",
        createdAt: "2022-01-03T08:28:00.261Z",
        value: "hdfc_debit card",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:28:00.261Z",
        __v: 0,
      },
      {
        _id: "61d2b3889e91750004082f98",
        deleted: false,
        visible: true,
        label: "HDFC (Regalia)",
        createdAt: "2022-01-03T08:27:52.849Z",
        value: "hdfc_credit card",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:27:52.849Z",
        __v: 0,
      },
      {
        _id: "61d2b39b9e91750004082f9a",
        deleted: false,
        visible: true,
        label: "ICICI",
        createdAt: "2022-01-03T08:28:11.740Z",
        value: "icici_credit card",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:28:11.740Z",
        __v: 0,
      },
      {
        _id: "679124f40e130d00596751a2",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_SOURCES",
        label: "Jupiter",
        value: "jupiter",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2025-01-22T17:03:48.239Z",
        updatedAt: "2025-01-22T17:03:48.239Z",
        __v: 0,
      },
      {
        _id: "6711560a7819ef004f4464e1",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_SOURCES",
        label: "Kotak",
        value: "kotak",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2024-10-17T18:23:06.977Z",
        updatedAt: "2024-10-17T18:23:06.977Z",
        __v: 0,
      },
      {
        _id: "61d2b3b59e91750004082f9d",
        deleted: false,
        visible: true,
        label: "Paytm",
        createdAt: "2022-01-03T08:28:37.505Z",
        value: "paytm",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:28:37.505Z",
        __v: 0,
      },
      {
        _id: "61d2b3ac9e91750004082f9c",
        deleted: false,
        visible: true,
        label: "SIB",
        createdAt: "2022-01-03T08:28:28.393Z",
        value: "sib_debit card",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        moduleName: "EXPENSE_SOURCES",
        updatedAt: "2022-01-03T08:28:28.393Z",
        __v: 0,
      },
      {
        _id: "64ea03a755da0b003f74560c",
        deleted: false,
        visible: true,
        moduleName: "EXPENSE_SOURCES",
        label: "Sodexo/Pluxee",
        value: "sodexo",
        source: "OCTON",
        userId: "5d51928bd6e5930004eccb38",
        createdAt: "2023-08-26T13:52:39.327Z",
        updatedAt: "2025-01-22T17:04:01.477Z",
        __v: 0,
        canDelete: true,
      },
    ],
  };
  const expenseTypes = {};

  user.expenseTypes.forEach(({ _id, label }) => {
    expenseTypes[_id] = label;
  });

  const expenseSources = {};
  user.expenseSources.forEach(({ _id, label }) => {
    expenseSources[_id] = label;
  });

  const expenseGroups = {};
  user.expenseGroups.forEach(({ _id, label }) => {
    expenseGroups[_id] = label;
  });

  const expenses = await ExpensesModel.find({ userId: user._id }).lean();

  const formattedExpenses = expenses.map((expense) => {
    const {
      date,
      amount,
      message,
      expenseTypeId,
      expenseSubTypeId,
      expenseSourceId,
      expenseGroupId,
      createdAt,
      excluded,
      favorite,
      _id,
    } = expense;

    return {
      Date: moment(date).format("YYYY-MM-DD"),
      Amount: amount,
      Message: message || "",
      "Expense Type": expenseTypes[expenseTypeId] || "NA",
      "Expense Sub-Type": expenseTypes[expenseSubTypeId] || "NA",
      "Expense Source": expenseSources[expenseSourceId] || "NA",
      "Expense Group Id": expenseGroups[expenseGroupId] || "NA",
      "Created At": moment(createdAt).format("YYYY-MM-DD"),
      Excluded: excluded ? "Yes" : "No",
      Favorite: favorite ? "Yes" : "No",
      ID: _id,
    };
  });

  res.send(formattedExpenses);
};
