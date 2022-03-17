const _ = require("lodash");
const { processId } = require("../../utils/common");
const PostModel = require("../post/post.model");
const UserModel = require("../user/user.model");
const TagsModel = require("../../modules/tags/tags.model");
const {
  generateDefaultTagInfo,
} = require("../../modules/tags/tags.operations");
const { generateDefaultUserState } = require("../user/user.utils");

exports.updateToNewTagsCollection = async (req, res) => {
  let usersList = await UserModel.find({}).lean();

  const response = [];
  const mapping = {
    expenseTypes: 0,
    expenseSources: 0,
    expenseApps: 0,
    collectionTags: 0,
  };

  usersList.forEach((user) => {
    if (user.expenseTypes) {
      const newTagsList = user.expenseTypes.map((obj) => {
        const newTag = generateDefaultTagInfo({
          obj,
          user,
          source: "OCTON",
          moduleName: "EXPENSE_TYPES",
        });

        return newTag;
      });
      response.push(...newTagsList);
      mapping.expenseTypes += newTagsList.length;
    }

    if (user.expenseSources) {
      const newTagsList = user.expenseSources.map((obj) => {
        const newTag = generateDefaultTagInfo({
          obj,
          user,
          source: "OCTON",
          moduleName: "EXPENSE_SOURCES",
        });

        return newTag;
      });
      response.push(...newTagsList);
      mapping.expenseSources += newTagsList.length;
    }

    if (user.expenseApps) {
      const newTagsList = user.expenseApps.map((obj) => {
        const newTag = generateDefaultTagInfo({
          obj,
          user,
          source: "OCTON",
          moduleName: "EXPENSE_APPS",
        });

        return newTag;
      });
      response.push(...newTagsList);
      mapping.expenseApps += newTagsList.length;
    }

    if (user.notebase) {
      user.notebase.forEach((collection) => {
        const newTagsList = collection.tags.map((tag) => {
          const newTag = generateDefaultTagInfo({
            obj: tag,
            user,
            source: "NOTEBASE",
            moduleName: "COLLECTION",
            moduleId: collection._id,
            deleted: false,
            visible: true,
          });

          return newTag;
        });

        response.push(...newTagsList);
        mapping.collectionTags += newTagsList.length;
      });
    }
  });
  let dbResponse;
  dbResponse = await TagsModel.create(response);
  res.send({
    totalUsers: usersList.length,
    mapping,
    totalTags: dbResponse.length,
    dbResponse,
  });
};

exports.mongoDbTest = async (req, res) => {
  // const updateResources = () => {
  //   db.getCollection("posts")
  //     .find({})
  //     .forEach((item) => {
  //       const newValues = item.resources
  //         ? item.resources.map((label) => ({ label }))
  //         : [];
  //       item.resources = newValues;
  //       db.posts.save(item);
  //     });
  // }

  let result = await PostModel.aggregate([
    { $sort: { _id: 1 } },
    { $project: { _id: 1, resources: 1, title: 1 } },
  ]);
  result = result
    .filter((item) => item.resources.length)
    .map((item) => item._id);
  res.send({ result, count: result.length });
};

exports.encryptPasswords = async (req, res) => {
  const users = await UserModel.find({});

  users.forEach(async (item) => {
    // const salt = bcrypt.genSaltSync(10);
    // const password = bcrypt.hashSync(item.password, salt);
    const { timeline, expenseTypes, ...rest } = generateDefaultUserState({
      source: "MIGRATION",
    });
    await UserModel.updateOne(
      { _id: processId(item._id) },
      {
        $set: {
          // password,
          // originalPassword: item.password,
          timeline: _.isEmpty(item.timeline) ? timeline : item.timeline,
          expenseTypes: _.isEmpty(item.expenseTypes)
            ? expenseTypes
            : item.expenseTypes,
          ...rest,
        },
      }
    );
  });

  res.send("ok");
};
