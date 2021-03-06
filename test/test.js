/* jshint: */
/*global public_functions assert require flipcss fs:true sinon:true */

fs = require("fs");
sinon = require("sinon");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../flipcss");
}

buster.assertions.add("pathFlipsTo", {
    assert: function (inputPath, expectedOutputPath) {
        var input = fs.readFileSync(inputPath).toString();
        var expectedOutput = fs.readFileSync(expectedOutputPath).toString();

        this.output = lib.flip(input);
        return this.output === expectedOutput;
    },
    assertMessage: "Expected ${0} to flip to ${1}, got \"${output}\".",
    refuteMessage: "Expected ${0} not to flip to ${1}, got \"${output}\"."
});

buster.assertions.add("flipsTo", {
    assert: function (input, expectedOutput) {
        this.output = lib.flip(input);
        return this.output === expectedOutput;
    },
    assertMessage: "Expected \"${0}\" to flip to \"${1}\", got \"${output}\".",
    refuteMessage: "Expected \"${0}\" not to flip to \"${1}\", got \"${output}\"."
});


buster.testCase("Functional tests: Test flipping a stylesheet, with pre-processing", {
    setUp: function () {
        sinon.spy(console, "log");
    },

    tearDown: function () {
        console.log.restore();
    },

    "test flip without warnings": function() {
        var pre_func = lib.clean;

        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = pre_func(input, "rtl");
        assert.flipsTo(input, output);
    },

    "test flipping with warnings": function() {
        var func = lib.flip;
        var pre_func = lib.clean;

        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = pre_func(input, "rtl");
        assert.equals(func(input, true), output);

        // Check that warnings are given
        assert(console.log.calledTwice);
        var spyCall = console.log.getCall(0);
        assert(-1 < spyCall.args[0].indexOf("Warning: Inline"));
    }
});

buster.testCase("Test swapping of words left and right", {
    "test swapping": function() {
        assert.pathFlipsTo("fixtures/input_swap_words.css",
                           "fixtures/output_swap_words.css");
    }
});

buster.testCase("Test swapping of values for margin/padding", {
    "test swapping": function() {
        assert.pathFlipsTo("fixtures/input_swap_values.css",
                           "fixtures/output_swap_values.css");
    }
});

buster.testCase("Test swapping of values for background position", {
    "test swapping": function() {
        assert.pathFlipsTo("fixtures/input_background_position.css",
                           "fixtures/output_background_position.css");
    }
});

buster.testCase("Add direction rule", {
    "test adding direction rule to body": function() {
        var input, output;

        input = "body { display: inline-block; }";
        output = "body {direction:rtl; display: inline-block; }";
        assert.flipsTo(input, output);

        input = "foo {} body { display: inline-block; } bar {}";
        output = "foo {} body {direction:rtl; display: inline-block; } bar {}";
        assert.flipsTo(input, output);
    },

    "test adding body group with direction rule": function() {
        var input = "div { display: inline-block; }";
        var output = "body{direction:rtl;}div { display: inline-block; }";
        assert.flipsTo(input, output);
    }
});

buster.testCase("Clean rules", {
    "test deleting rtl-only CSS rules": function() {
        var func = lib.clean;

        var input = fs.readFileSync("fixtures/input_delete_rule.css").toString();
        var output = fs.readFileSync("fixtures/output_delete_rule.css").toString();
        assert.equals(func(input, "ltr"), output);
    }
});
