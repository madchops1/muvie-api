import { Component, OnInit, NgZone, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import Peer from 'peerjs';
import { HttpClient } from '@angular/common/http';

import { GridsterConfig, GridsterItem, DisplayGrid, GridType, GridsterItemComponentInterface } from 'angular-gridster2';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SocketService } from '../socket.service';

import * as p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';

import { UtilityService } from '../utility.service';
import { environment } from 'src/environments/environment';

import * as THREE from 'three';

import * as uuid from 'uuid/v4';



THREE.CustomShader = {

    uniforms: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
    },

    vertexShader: [
        "uniform float time;",
        "uniform vec2 resolution;",
        "void main() {",
        "gl_Position = vec4(position, 1.0);",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform float time;",
        "uniform vec2 resolution;",
        "void main() {",
        "float x = mod(time + gl_FragCoord.x, 20.) < 10. ? 1. : 0.;",
        "float y = mod(time + gl_FragCoord.y, 20.) < 10. ? 1. : 0.;",
        "gl_FragColor = vec4(vec3(min(x, y)), 1.);",
        "}"
    ].join("\n")

};

THREE.AdditiveBlendShader = {

    uniforms: {

        "tBase": { type: "t", value: null },
        "tAdd": { type: "t", value: null },
        "amount": { type: "f", value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [


        "uniform sampler2D tBase;",
        "uniform sampler2D tAdd;",
        "uniform float amount;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel1 = texture2D( tBase, vUv );",
        "vec4 texel2 = texture2D( tAdd, vUv );",
        "gl_FragColor = texel1 + texel2 * amount;",

        "}"

    ].join("\n")

};

THREE.BadTVShader = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "distortion": { type: "f", value: 3.0 },
        "distortion2": { type: "f", value: 5.0 },
        "speed": { type: "f", value: 0.1 },
        "rollSpeed": { type: "f", value: 0.05 },
    },

    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float time;",
        "uniform float distortion;",
        "uniform float distortion2;",
        "uniform float speed;",
        "uniform float rollSpeed;",
        "varying vec2 vUv;",

        // Start Ashima 2D Simplex Noise

        "vec3 mod289(vec3 x) {",
        "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",

        "vec2 mod289(vec2 x) {",
        "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",

        "vec3 permute(vec3 x) {",
        "  return mod289(((x*34.0)+1.0)*x);",
        "}",

        "float snoise(vec2 v)",
        "  {",
        "  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
        "                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
        "                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
        "                      0.024390243902439); // 1.0 / 41.0",
        "  vec2 i  = floor(v + dot(v, C.yy) );",
        "  vec2 x0 = v -   i + dot(i, C.xx);",

        "  vec2 i1;",
        "  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
        "  vec4 x12 = x0.xyxy + C.xxzz;",
        " x12.xy -= i1;",

        "  i = mod289(i); // Avoid truncation effects in permutation",
        "  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
        "		+ i.x + vec3(0.0, i1.x, 1.0 ));",

        "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
        "  m = m*m ;",
        "  m = m*m ;",

        "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
        "  vec3 h = abs(x) - 0.5;",
        "  vec3 ox = floor(x + 0.5);",
        "  vec3 a0 = x - ox;",

        "  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

        "  vec3 g;",
        "  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
        "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
        "  return 130.0 * dot(m, g);",
        "}",

        // End Ashima 2D Simplex Noise

        "void main() {",

        "vec2 p = vUv;",
        "float ty = time*speed;",
        "float yt = p.y - ty;",

        //smooth distortion
        "float offset = snoise(vec2(yt*3.0,0.0))*0.2;",
        // boost distortion
        //"offset = pow( offset*distortion,3.0)/distortion;", //pow fails on ios for x = 0, giving black bars
        "offset = offset*distortion * offset*distortion * offset;",
        //add fine grain distortion
        "offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;",
        //combine distortion on X with roll on Y
        "gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));",

        "}"

    ].join("\n")

};

THREE.EffectComposer = function (renderer, renderTarget = undefined) {

    this.renderer = renderer;

    if (renderTarget === undefined) {

        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        //console.log('HOTEL', width, height);
        var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

        renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];

    if (THREE.CopyShader === undefined)
        console.error("THREE.EffectComposer relies on THREE.CopyShader");

    this.copyPass = new THREE.ShaderPass(THREE.CopyShader);

};

THREE.EffectComposer.prototype = {

    swapBuffers: function () {

        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;

    },

    addPass: function (pass) {

        this.passes.push(pass);

    },

    insertPass: function (pass, index) {

        this.passes.splice(index, 0, pass);

    },

    render: function (delta) {

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        var maskActive = false;

        var pass, i, il = this.passes.length;

        for (i = 0; i < il; i++) {

            pass = this.passes[i];

            if (!pass.enabled) continue;

            pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

            if (pass.needsSwap) {

                if (maskActive) {

                    var context = this.renderer.context;

                    context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

                    this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);

                    context.stencilFunc(context.EQUAL, 1, 0xffffffff);

                }

                this.swapBuffers();

            }

            if (pass instanceof THREE.MaskPass) {

                maskActive = true;

            } else if (pass instanceof THREE.ClearMaskPass) {

                maskActive = false;

            }

        }

    },

    reset: function (renderTarget) {

        if (renderTarget === undefined) {

            renderTarget = this.renderTarget1.clone();

            renderTarget.width = window.innerWidth;
            renderTarget.height = window.innerHeight;

        }

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    },

    setSize: function (width, height) {

        var renderTarget = this.renderTarget1.clone();

        renderTarget.width = width;
        renderTarget.height = height;

        this.reset(renderTarget);

    }

};

THREE.RenderPass = function (scene, camera, overrideMaterial?, clearColor?, clearAlpha?) {

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 1;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;

};

THREE.RenderPass.prototype = {

    render: function (renderer, writeBuffer, readBuffer, delta) {

        this.scene.overrideMaterial = this.overrideMaterial;

        if (this.clearColor) {

            this.oldClearColor.copy(renderer.getClearColor());
            this.oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(this.clearColor, this.clearAlpha);

        }

        renderer.render(this.scene, this.camera, readBuffer, this.clear);

        if (this.clearColor) {

            renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);

        }

        this.scene.overrideMaterial = null;

    }
};

THREE.MaskPass = function (scene, camera) {

    this.scene = scene;
    this.camera = camera;

    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;

    this.inverse = false;

};

THREE.MaskPass.prototype = {

    render: function (renderer, writeBuffer, readBuffer, delta) {

        var context = renderer.context;

        // don't update color or depth

        context.colorMask(false, false, false, false);
        context.depthMask(false);

        // set up stencil

        var writeValue, clearValue;

        if (this.inverse) {

            writeValue = 0;
            clearValue = 1;

        } else {

            writeValue = 1;
            clearValue = 0;

        }

        context.enable(context.STENCIL_TEST);
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
        context.clearStencil(clearValue);

        // draw into the stencil buffer

        renderer.render(this.scene, this.camera, readBuffer, this.clear);
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);

        // re-enable update of color and depth

        context.colorMask(true, true, true, true);
        context.depthMask(true);

        // only render where stencil is set to 1

        context.stencilFunc(context.EQUAL, 1, 0xffffffff);  // draw if == 1
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);

    }

};

THREE.ClearMaskPass = function () {

    this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

    render: function (renderer, writeBuffer, readBuffer, delta) {

        var context = renderer.context;

        context.disable(context.STENCIL_TEST);

    }

};

THREE.ShaderPass = function (shader, textureID = "tDiffuse") {

    this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.material = new THREE.ShaderMaterial({

        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

    });

    this.renderToScreen = false;

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;

};

THREE.ShaderPass.prototype = {

    render: function (renderer, writeBuffer, readBuffer, delta) {

        if (this.uniforms[this.textureID]) {

            this.uniforms[this.textureID].value = readBuffer;

        }

        THREE.EffectComposer.quad.material = this.material;

        if (this.renderToScreen) {

            renderer.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera);

        } else {

            renderer.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, this.clear);

        }

    }

};

THREE.BloomPass = function (strength, kernelSize, sigma, resolution) {

    strength = (strength !== undefined) ? strength : 1;
    kernelSize = (kernelSize !== undefined) ? kernelSize : 25;
    sigma = (sigma !== undefined) ? sigma : 4.0;
    resolution = (resolution !== undefined) ? resolution : 256;

    // render targets

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

    this.renderTargetX = new THREE.WebGLRenderTarget(resolution, resolution, pars);
    this.renderTargetY = new THREE.WebGLRenderTarget(resolution, resolution, pars);

    // copy material

    if (THREE.CopyShader === undefined)
        console.error("THREE.BloomPass relies on THREE.CopyShader");

    var copyShader = THREE.CopyShader;

    this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);

    this.copyUniforms["opacity"].value = strength;

    this.materialCopy = new THREE.ShaderMaterial({

        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true

    });

    // convolution material

    if (THREE.ConvolutionShader === undefined)
        console.error("THREE.BloomPass relies on THREE.ConvolutionShader");

    var convolutionShader = THREE.ConvolutionShader;

    this.convolutionUniforms = THREE.UniformsUtils.clone(convolutionShader.uniforms);

    this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurx;
    this.convolutionUniforms["cKernel"].value = THREE.ConvolutionShader.buildKernel(sigma);

    this.materialConvolution = new THREE.ShaderMaterial({

        uniforms: this.convolutionUniforms,
        vertexShader: convolutionShader.vertexShader,
        fragmentShader: convolutionShader.fragmentShader,
        defines: {
            "KERNEL_SIZE_FLOAT": kernelSize.toFixed(1),
            "KERNEL_SIZE_INT": kernelSize.toFixed(0)
        }

    });

    this.enabled = true;
    this.needsSwap = false;
    this.clear = false;

};

THREE.BloomPass.prototype = {

    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {

        if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

        // Render quad with blured scene into texture (convolution pass 1)

        THREE.EffectComposer.quad.material = this.materialConvolution;

        this.convolutionUniforms["tDiffuse"].value = readBuffer;
        this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurX;

        renderer.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetX, true);


        // Render quad with blured scene into texture (convolution pass 2)

        this.convolutionUniforms["tDiffuse"].value = this.renderTargetX;
        this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurY;

        renderer.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetY, true);

        // Render original scene with superimposed blur to texture

        THREE.EffectComposer.quad.material = this.materialCopy;

        this.copyUniforms["tDiffuse"].value = this.renderTargetY;

        if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

        renderer.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, readBuffer, this.clear);

    }

};

THREE.BloomPass.blurX = new THREE.Vector2(0.001953125, 0.0);
THREE.BloomPass.blurY = new THREE.Vector2(0.0, 0.001953125);

THREE.CopyShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "opacity": { type: "f", value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "gl_FragColor = opacity * texel;",

        "}"

    ].join("\n")

};

THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "uImageIncrement": { type: "v2", value: new THREE.Vector2(0.001953125, 0.0) },
        "cKernel": { type: "fv1", value: [] }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 imageCoord = vUv;",
        "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

        "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

        "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
        "imageCoord += uImageIncrement;",

        "}",

        "gl_FragColor = sum;",

        "}"


    ].join("\n"),

    buildKernel: function (sigma) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss(x, sigma) {

            return Math.exp(- (x * x) / (2.0 * sigma * sigma));

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

        if (kernelSize > kMaxKernelSize) kernelSize = kMaxKernelSize;
        halfWidth = (kernelSize - 1) * 0.5;

        values = new Array(kernelSize);
        sum = 0.0;
        for (i = 0; i < kernelSize; ++i) {

            values[i] = gauss(i - halfWidth, sigma);
            sum += values[i];

        }

        // normalize the kernel

        for (i = 0; i < kernelSize; ++i) values[i] /= sum;

        return values;

    }

};

THREE.HorizontalBlurShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "h": { type: "f", value: 1.0 / 512.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float h;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 sum = vec4( 0.0 );",

        "sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

        "gl_FragColor = sum;",

        "}"

    ].join("\n")

};

THREE.VerticalBlurShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "v": { type: "f", value: 1.0 / 512.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float v;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 sum = vec4( 0.0 );",

        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

        "gl_FragColor = sum;",

        "}"

    ].join("\n")

};

THREE.MirrorShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "side": { type: "i", value: 1 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform int side;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 p = vUv;",
        "if (side == 0){",
        "if (p.x > 0.5) p.x = 1.0 - p.x;",
        "}else if (side == 1){",
        "if (p.x < 0.5) p.x = 1.0 - p.x;",
        "}else if (side == 2){",
        "if (p.y < 0.5) p.y = 1.0 - p.y;",
        "}else if (side == 3){",
        "if (p.y > 0.5) p.y = 1.0 - p.y;",
        "} ",
        "vec4 color = texture2D(tDiffuse, p);",
        "gl_FragColor = color;",

        "}"

    ].join("\n")

};

THREE.RGBShiftShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "amount": { type: "f", value: 0.005 },
        "angle": { type: "f", value: 0.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float amount;",
        "uniform float angle;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 offset = amount * vec2( cos(angle), sin(angle));",
        "vec4 cr = texture2D(tDiffuse, vUv + offset);",
        "vec4 cga = texture2D(tDiffuse, vUv);",
        "vec4 cb = texture2D(tDiffuse, vUv - offset);",
        "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

        "}"

    ].join("\n")

};

THREE.FilmShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.5 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount": { type: "f", value: 4096 },
        "grayscale": { type: "i", value: 1 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        // control parameter
        "uniform float time;",

        "uniform bool grayscale;",

        // noise effect intensity value (0 = no effect, 1 = full effect)
        "uniform float nIntensity;",

        // scanlines effect intensity value (0 = no effect, 1 = full effect)
        "uniform float sIntensity;",

        // scanlines effect count value (0 = no effect, 4096 = full effect)
        "uniform float sCount;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        // sample the source
        "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

        // make some noise
        "float x = vUv.x * vUv.y * time *  1000.0;",
        "x = mod( x, 13.0 ) * mod( x, 123.0 );",
        "float dx = mod( x, 0.01 );",

        // add noise
        "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

        // get us a sine and cosine
        "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

        // add scanlines
        "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

        // interpolate between source and result by intensity
        "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

        // convert to grayscale if desired
        "if( grayscale ) {",

        "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

        "}",

        "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

        "}"

    ].join("\n")

};

// Extend the canvas element type
interface CanvasElement extends HTMLCanvasElement {
    captureStream(): void;
}

@Component({
    selector: 'app-live-stream',
    templateUrl: './live-stream.component.html',
    styleUrls: ['./live-stream.component.scss'],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})

export class LiveStreamComponent implements OnInit {

    @ViewChild('rendererContainer') rendererContainer: ElementRef; // three container
    @ViewChild('rendererCanvas') rendererCanvas: any; // three canvas

    // Environment stuff
    public websiteUrl: any = environment.websiteUrl;
    public environment: any = environment;
    public apiUrl: any = environment.ioUrl;

    track: any = {
        name: "Track 1",
        modules: [],
        keyword: '',
        settings: {
            timeSignature: '4/4',
            changeOn: 'Measure/Beatx4',
            file: '',
            fileObject: {},
        }
    };

    currentModule = 0;
    lastModule = 1000000;

    basicModules: any = [
        // Media
        {
            name: "Media",
            icon: "add_to_photos",
            description: "MP4, GIF, JPG, PNG",
            plan: 0,
            offline: false
        }
    ];

    // Module Grid
    modOptions: GridsterConfig;
    modGrid: Array<GridsterItem>;

    canvas: any;                // Deprecated canvas for the main p5 preview
    canvas2: any;               // canvas for the p5 audio analyzer
    canvas3: HTMLCanvasElement; // canvas for main three.js preview
    video: any;                 // for the host video
    videoSize: any;

    screenW: any;
    screenH: any;

    dontDraw: any = false;
    clearFlag: any = false;
    sketchLoading: any = false;
    resizeId: any;
    animating = false;
    playing: any = false;
    pause: any = false;

    // For three js
    renderer = new THREE.WebGLRenderer();
    scene = null;
    camera = null;
    oCamera = null;
    pCamera = null;
    threeLoaded = false;

    frameId;

    // threeMedia
    threeMedia: any = [];

    // Search stuff
    searchGifs: any = false;    // view toggle
    searchImages: any = false;  // view toggle
    browseVideos: any = false;  // view toggle
    searchTag: any = 'pattern'; // search tag
    gifResults: any = false;    // holds gif results
    imageResults: any = false;  // holds img results
    currentBrowseArtist = 0;    // current artist being browsed
    currentBrowseArtistCollection = 0;
    videoLibrary: any = [
        {
            name: 'beeple',
            link: 'http://beeple-crap.com',
            imageUrl: 'https://static.wixstatic.com/media/a64726_ce7a64e6ade34b549d0b3d06963bead9~mv2.jpg/v1/fill/w_263,h_292,al_c,q_80,usm_0.66_1.00_0.01/a64726_ce7a64e6ade34b549d0b3d06963bead9~mv2.webp',
            collections: [
                {
                    name: 'fallback',
                    downloadUrl: 'https//www.google.com',
                    videos: [
                        {
                            name: 'atommy',
                            mp4: 'https://s3.us-east-2.amazonaws.com/visualz-1/atommy.mp4'
                        }
                    ]
                }
            ]
        }
    ];

    moduleLimit: any = 12;

    // Beat/Measure Time Signature Stuff
    beat: any = 1;
    measure: any = 1;
    timeSignatureOptions: any = ['4/4']; // ['4/4', '3/4'];
    changeOnOptions: any = ['Measurex2/Beatx8', 'Measure/Beatx4', 'Beatx2', 'Beat'];

    // Beat Detection
    timeSinceLastBeat: any = 0;
    lastBeatTime: any = 0;
    beatThreshold: any = 0.11;  // initial beat threshold
    beatDecayRate: any = 0.98;  // //0.98; // beat decay rate
    beatHoldFrames: any = 10;   // 8 // 10
    beatChange: any = false;    // beat detection
    beatFx: any = false;        // beat fx duration is for 300ms
    sceneChange: any = false;   // scene change
    beatMin: any = 0.15;        // beat minimum level

    // Used for oscilliscope effect
    screenMicLoaded: any = false;

    // Audio Visualization Stuff
    spectrum: any;
    analyzer: any;
    mic: any;
    osc: any;
    numSamples: any;
    speed: any = 4;
    myCanvas: any;
    byteFrequencyData: any;
    byteTimeData: any;

    // ALPHA MODULE - THREE
    mesh = null;
    geometry = null;
    material = null;
    holder;
    barCount: any = 16;
    levelsCount: any = 16;
    binCount;
    vertDistance;
    fillFactor = 0.8;
    planeWidth = 3000;
    segments = 10;
    groupHolder;
    shapeGroupHolder;
    drewNewShape = false;
    shapes = [];
    shapesCount = 0;
    scl = 0;
    radius = 1000;

    __boxSize: any;
    __geometry: any; //  = new THREE.BoxGeometry(this.__boxSize, this.__boxSize, this.__boxSize);
    __material: any; // = new THREE.MeshNormalMaterial({ color: 0x00ff00 });
    __cube: any; // = new THREE.Mesh(this.__geometry, this.__material);
    __texture: any;

    // Audio Visualizer
    volume: any = 0;
    level;
    levels;
    levelsData: any = [];

    frameRate: any = 60;

    // BPM Stuff
    bpm: any = 0.00;
    bpmTime: any = 0;           // bpmTime ranges from 0 to 1. 0 = on beat. Based on tap bpm
    ratedBPMTime: any = 550;    // time between beats (msec) multiplied by BPMRate
    bpmStart: any;
    msecsAvg: any = 633;        // time between beats (msec)
    timer;
    gotBeat: any = false;
    count = 0;
    msecsFirst = 0;
    msecsPrevious = 0;

    currentRoute: any = '';
    peer: any = null;
    //video: any;
    //mid: any;
    //remotePeerId: any;
    peerId: any = false;

    roomName: any;

    //interacted: any = false;

    //
    //dontDraw: any = false;

    constructor(
        private ngZone: NgZone,
        private utilityService: UtilityService,
        private route: ActivatedRoute,
        private router: Router,
        private socketService: SocketService,
        private httpClient: HttpClient) {

        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.currentRoute = val.url;
                let routeArray = this.currentRoute.split("/");
                //this.mid = routeArray[routeArray.length - 1];
                this.roomName = routeArray[routeArray.length - 1];
                console.log('roomName', this.roomName);
                //console.log('remotePeerId', this.remotePeerId);
            }
        });

    }

    ngOnInit() {

        this.initModGrid();
        this.drawCanvas();

    }

    // Create a media object for three.js
    mediaObject() {
        return {
            light: <any>{},
            mesh: <any>{},
            material: <any>{},
            texture: <any>{},
            geometry: <any>{},
            text: <any>{
                canvas: <any>{},
                context: <any>{},
                texture: <any>{},
                material: <any>{},
                geometry: <any>{},
                mesh: <any>{}
            },
            loaded: <any>false
        }
    }

    // THREE.js render
    render3() {
        //this.animating = true;
        this.frameId = requestAnimationFrame(() => {
            this.render3();
        });

        this.threeLoaded = true;

        if (this.pause || this.browseVideos) {
            //s.clear();
            return false;
        }

        if (!this.animating) { return false; }

        //this.__cube.rotation.x += 0.01
        //this.__cube.rotation.z += 0.01

        // Module name
        let moduleName = '';

        // Execute the threeFunction for the module
        if (this.track.modules.length &&
            this.track.modules[this.currentModule] &&
            this.track.modules[this.currentModule].engine == 'three') {

            this[this.track.modules[this.currentModule].threeFunction](this.currentModule);
            moduleName = this.track.modules[this.currentModule].name;
        }
        // else clear scene
        else {
            //this.scene.remove.apply(this.scene, this.scene.children);
            //this.renderer.setClearColor(0x000000, 0);
        }

        this.renderer.render(this.scene, this.camera);
        this.renderer.autoClear = false;

    }

    // THREE.js animate
    animate() {

        // We have to run this outside angular zones,
        // because it could trigger heavy changeDetection cycles.
        this.ngZone.runOutsideAngular(() => {
            if (document.readyState !== 'loading') {
                this.render3();
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    this.render3();
                });
            }
        });
    }

    // THREE.js Create scene
    createScene(canvas: ElementRef<HTMLCanvasElement>) {
        return new Promise((resolve, reject) => {

            //this.updateExternalWindows();

            //console.log('canvas', canvas);
            this.sketchLoading = true;
            this.lastModule = 1000000; // reset last module on setup
            let container = document.getElementById('renderContainer');

            // let previewSize: any = this.utilityService.calcPreviewSize(
            //     this.track.settings.resolution.aspectRatio.x,
            //     this.tracks[this.currentTrack].settings.resolution.aspectRatio.y,
            //     container.offsetWidth,
            //     container.offsetHeight);

            this.screenW = container.offsetWidth;
            this.screenH = container.offsetHeight;
            //console.log('previewSize', previewSize);
            //this.screenW = previewSize.w;
            //this.screenH = previewSize.h;

            //console.log('DIMS', canva.offsetWidth, canva.offsetHeight);
            // Set animating to false will stop render;
            this.animating = false;
            THREE.EffectComposer.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            THREE.EffectComposer.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
            THREE.EffectComposer.scene = new THREE.Scene();
            THREE.EffectComposer.scene.add(THREE.EffectComposer.quad);

            this.canvas3 = canvas.nativeElement;

            // Cleanup
            this.renderer = null;
            delete this.renderer;

            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas3,
                //alpha: true,      // transparent background
                antialias: true     // smooth edges
            });

            this.renderer.setSize(this.screenW, this.screenH);
            this.renderer.sortObjects = false;
            this.scene = new THREE.Scene();
            this.pCamera = new THREE.PerspectiveCamera(70, this.screenW / this.screenH, 1, 3000);
            this.oCamera = new THREE.OrthographicCamera(this.screenW / - 2, this.screenW / 2, this.screenH / 2, this.screenH / - 2, 1, 3000);

            this.camera = this.oCamera;
            this.camera.position.z = 1000;

            // this.__boxSize = this.screenH / 2;
            // this.__geometry = new THREE.BoxGeometry(this.__boxSize, this.__boxSize, this.__boxSize);
            // this.__material = new THREE.MeshNormalMaterial({ color: 0x00ff00 });
            // this.__cube = new THREE.Mesh(this.__geometry, this.__material);
            // this.scene.add(this.__cube);
            this.addWebcamBox();

            //this.animating = true
            //resolve();

            // Setup

            setTimeout(() => {
                if (this.track.modules.length > 0) {
                    this.track.modules.forEach((module, index) => {

                        // Mem/Cleanup remove the threeMedia object
                        if (this.threeMedia[module.uuid]) {
                            this.threeMedia[module.uuid] = null;
                            delete this.threeMedia[module.uuid];
                        }

                        // Switch case for module definition and setup
                        switch (module.name) {

                            // Media: Gif, Video, Image
                            case 'Media':
                                this.threeMedia[module.uuid] = this.mediaObject();

                                // text FX needs a canvas for each module,
                                // get the canvas and the context
                                this.threeMedia[module.uuid].text.canvas = document.getElementById('canvas-' + module.uuid);
                                this.threeMedia[module.uuid].text.context = this.threeMedia[module.uuid].text.canvas.getContext('2d');

                                // get the extension / fileType of the media
                                let extension = this.utilityService.getFileType(module.settings.file);
                                this.track.modules[index].settings.fileType = extension;

                                // Switch case for file type
                                if (extension) {

                                    //
                                    let ext = false;
                                    // special for photo
                                    if (extension.includes('com/photo')) {
                                        ext = extension;
                                    }

                                    switch (extension) {

                                        // Mp4: gifs, and videos
                                        case 'mp4':
                                            let video = document.getElementById('video-' + module.uuid);
                                            if (video) {
                                                video['muted'] = true;
                                                video['autoplay'] = true;
                                                this.threeMedia[module.uuid].texture = new THREE.Texture(video);
                                                this.threeMedia[module.uuid].geometry = new THREE.CubeGeometry(this.screenW, this.screenH, 100);
                                                this.threeMedia[module.uuid].material = new THREE.MeshBasicMaterial({
                                                    map: this.threeMedia[module.uuid].texture
                                                });
                                                this.threeMedia[module.uuid].mesh = new THREE.Mesh(this.threeMedia[module.uuid].geometry, this.threeMedia[module.uuid].material);

                                                // Get block image
                                                if (module.settings.blockImage == "") {
                                                    try {
                                                        this.apiGetBlockImage(module.settings.file, index);
                                                    } catch (err) {
                                                        console.log('err', err);
                                                    }
                                                }
                                            }
                                            break;

                                        //case (extension.includes('com/photo') ? extension : false):
                                        case ext:
                                        case 'jpg':
                                        case 'jpeg':
                                        case 'png':
                                            this.threeMedia[module.uuid].texture = new THREE.TextureLoader();
                                            this.threeMedia[module.uuid].texture.load(module.settings.file, (texture) => {
                                                this.threeMedia[module.uuid].geometry = new THREE.CubeGeometry(this.screenW, this.screenH, 100);
                                                this.threeMedia[module.uuid].material = new THREE.MeshBasicMaterial({
                                                    map: texture
                                                });
                                                this.threeMedia[module.uuid].mesh = new THREE.Mesh(this.threeMedia[module.uuid].geometry, this.threeMedia[module.uuid].material);
                                                this.threeMedia[module.uuid].loaded = true;
                                            });
                                            break;

                                        default:

                                            break;
                                    }
                                }
                                // reload if null
                                else {
                                    //this.createScene(this.rendererCanvas);
                                    reject();
                                    return false;
                                }

                                break;
                        }
                    });

                }
                // Else
                else {
                    this.sketchLoading = false;
                }
                this.animating = true;
                resolve();
                return;
            }, 1);
        });
    }

    // drawCanas w/ timeout
    delayDrawCanvas(t = 1000) {
        this.sketchLoading = true;
        setTimeout(() => {
            this.drawCanvas();
        }, t);
    }

    // drawcanas
    drawCanvas(): any {

        if (this.dontDraw) { this.dontDraw = false; return; }
        console.log('Draw Canvas');
        this.sketchLoading = true;

        //
        // Setup and run main three.js canvas
        //
        this.video = document.getElementById('webcamVideo');
        //
        // Setup and run audio analyzer p5 canvas
        //
        if (this.canvas2) {
            this.canvas2.remove();
            this.canvas2 = null;
            delete this.canvas2;
        }
        this.canvas2 = new p5(this.sketchInput);

        // Setup and run the video
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                // apply the stream to the video element used in the texture
                this.video.srcObject = stream;
                this.video.play();
            });
        }

        this.createScene(this.rendererCanvas).then(() => {
            // Only run the animate function one time and one time only
            if (!this.threeLoaded) {
                this.animate();
            }
        }, (err) => {
            console.log('err', err);
            this.drawCanvas();
            return;
        });


    }

    addWebcamBox(): any {

        this.__boxSize = this.screenH / 2;
        console.log('__boxSize', this.__boxSize);
        this.__texture = new THREE.VideoTexture(this.video);
        this.__geometry = new THREE.PlaneBufferGeometry(this.__boxSize, (this.__boxSize * 720 / 1280));
        //geometry.scale(0.5, 0.5, 0.5);
        this.__material = new THREE.MeshBasicMaterial({ map: this.__texture });
        this.__cube = new THREE.Mesh(this.__geometry, this.__material);
        this.scene.add(this.__cube);
        this.__cube.position.z = 700;
        this.__cube.position.y = 50;
    }

    initModGrid(): any {
        this.modOptions = {
            gridType: GridType.Fit,
            displayGrid: DisplayGrid.Always,
            keepFixedWidthInMobile: true,
            keepFixedHeightInMobile: true,
            fixedColWidth: 100,
            mobileBreakpoint: 1,
            minCols: 12,
            minRows: 1,
            maxCols: 12,
            maxRows: 1,
            pushItems: true,
            pushDirections: { north: false, east: true, south: false, west: true },
            itemChangeCallback: this.changeModule.bind(this),
            swap: true,
            draggable: {
                enabled: true
            },
            resizable: {
                enabled: false
            }
        };
    }

    // Direct copy from app
    changeModule(item: GridsterItem, itemComponent: GridsterItemComponentInterface): any {
        this.compactModules();
        let m;
        let i = 0;
        this.track.modules.forEach(element => {

            if (element.x == item.x && element.y == item.y) {

                m = i;
            }
            i++;
        });
        this.currentModule = m;
    }

    // Direct copy from app
    compactModules(): any {
        this.ngZone.run(() => {
            this.track.modules.sort(function (a, b) {
                if (a.y < b.y) {
                    return -1;
                }
                if (a.y > b.y) {
                    return 1;
                }
                if (a.x < b.x) {
                    return -1;
                }
                if (a.x > b.x) {
                    return 1;
                }
                return 0;
            });
        });
    }

    // No DatGui
    editModule(e, i): any {
        this.ngZone.runOutsideAngular(() => {

            console.log('MODULE', this.track.modules[this.currentModule]);
            this.currentModule = i;

        });
    }


    addModule(i, keyword = 'visuals', draw = true, fileObject: any = false): any {
        this.sketchLoading = true; // Show loading spinner
        this.clearFlag = true;

        let p5uuid = uuid();
        const basicModules = [
            // Media module, gifs, videos, images
            {
                name: "Media",
                icon: "add_to_photos",
                x: 0,
                y: 0,
                cols: 1,
                rows: 1,
                loading: false,
                engine: 'three',
                settings: {
                    file: '',
                    searchGifs: true,
                    browseVideos: true,
                    searchImages: true,
                    blockColor: '#CCCCCC',
                    blockImage: '',
                    fileObject: {},
                    fileType: '',
                    tag: keyword//,
                    //imageDatGui: this.newImageDatGui()
                },
                threeFunction: 'playMediaModuleThree',
                uuid: uuid(),
                addCallback: (m) => {
                    // Get a gif afer module add
                    let res, err;
                    this.track.modules[m].loading = true;
                    this.getGif(keyword).then(res => {
                        console.log('getGif', m, res.data);
                        this.track.modules[m].settings.file = res.data.image_mp4_url + "?v=" + Math.random() + "&m=" + String(m);
                        this.track.modules[m].settings.blockImage = res.data.fixed_height_small_still_url + "?v=" + Math.random() + "&m=" + String(m);
                        this.track.modules[m].loading = false;
                        if (draw) { this.delayDrawCanvas(500); }
                        return;
                    }, err => {
                        console.log('err', err);
                    });
                }
            }
        ];

        if (this.track.modules.length < this.moduleLimit) {

            // get the module
            const module = basicModules[i];

            // handle fileObject
            // if there is a file object replace the block image, etc...
            //console.log('ALPHA', fileObject);
            if (fileObject) {
                if (fileObject.path !== "") {
                    module.settings.file = fileObject.path;
                    module.settings.blockImage = fileObject.path;
                } else {
                    module.settings.file = fileObject.name;
                    module.settings.blockImage = fileObject.name;
                }
                module.settings.fileObject = fileObject;
            }

            // Find the open spot in between if there is one
            // set x,y before the module is added
            let x = 0;
            let y = 0;
            let emptyBetweenSpot = false;
            for (let z = 0; z < this.track.modules.length; z++) {

                let element = this.track.modules[z];
                //console.log('spot', x, y, element);

                if (element.x != x || element.y != y) {
                    // empty between spot
                    module.x = x;
                    module.y = y;
                    //console.log('empty spot', x, y);
                    emptyBetweenSpot = true;
                    break;
                }

                x++;
                if (x == 12) { x = 0; y++; }

                // set to the last module if no between spot
                module.x = x;
                module.y = y;
            }

            // add the module
            this.track.modules.push(module);

            // Compact the gui
            this.compactModules();

            // find m no matter where it is
            x = module.x;
            y = module.y;
            let a = 0;
            let m;
            this.track.modules.forEach(element => {
                if (element.x == x && element.y == y) {
                    m = a;
                }
                a++;
            });

            if (module.addCallback) {
                module.addCallback(m);
            }

            if (draw) {
                this.sketchLoading = true;

                // Select new module
                setTimeout(() => {
                    this.editModule(false, m);
                }, 1);

                // Redraw Canvas
                this.drawCanvas();
            }
        }
    }


    onResize(e): any {
        console.log('window resized', e);
        this.sketchLoading = true;
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.doneResizing(e);
        }, 1500);
    }

    doneResizing(e): any {
        this.drawCanvas();
        console.log('finished resizing', e);
    }

    sketchInput = (s) => {
        let mic;
        let amplitude;
        let recorder;
        let fft;
        let soundFile;
        let ellipseWidth;
        let peakDetect;
        let beatHoldFrames = this.beatHoldFrames;

        // what amplitude level can trigger a beat?
        let beatThreshold = this.beatThreshold;

        // When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
        // Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
        let beatCutoff = 0;
        let beatTime = 0;
        let framesSinceLastBeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.
        let levelBins;
        let freqByteData = new Uint8Array(this.binCount);
        let timeByteData = new Uint8Array(this.binCount);

        //let backgroundColor = s.color(s.random(0, 255), s.random(0, 255), s.random(0, 255));

        let micLoaded = false;
        s.preload = () => {
            // preload code
        }

        s.setup = () => {
            // s.userStartAudio().then(() => {
            //     console.log('user start audio');
            // }, (err) => {
            //     console.log('err', err);
            // });
            //s.getAudioContext().resume();

            s.disableFriendlyErrors = true;
            let myCanvas = s.createCanvas(200, 64);

            myCanvas.parent("waveform");
            s.frameRate(this.frameRate); //s.frameRate(this.frameRate); //
            mic = new p5.AudioIn((err) => { console.log('mic err', err); });
            s.noFill();
            //if (this.previewMode) { return false; }
            this.screenMicLoaded = false;
            mic.getSources(devices => {
                //console.log(devices);
                mic.setSource(0);
                mic.start(success => {
                    //this.analyzer = new p5.FFT(0, 1024);
                    this.analyzer = new p5.FFT(0, 1024);
                    this.analyzer.setInput(mic);
                    this.screenMicLoaded = true;

                    //console.log('mic', mic, mic.getLevel());
                    //console.log('ANALYZER', this.analyzer);

                    this.binCount = 1024; //this.analyzer.bins; // = 1024
                    levelBins = Math.floor(this.binCount / this.levelsCount); //number of bins in each level

                    this.osc = new p5.Oscillator();

                    fft = new p5.FFT();
                    fft.setInput(mic);

                    amplitude = new p5.Amplitude();
                    amplitude.setInput(mic);
                    amplitude.smooth(0.8);

                    //peakDetect = new p5.PeakDetect(this.freq1, this.freq2, this.threshold, this.framesPerPeak);
                    //peakDetect = new p5.PeakDetect();
                    micLoaded = true;

                    //assume 120BPM
                    this.msecsAvg = 640;
                    if (this.timer) { clearInterval(this.timer); }
                    this.timer = setInterval(this.onBPMBeat, this.msecsAvg);
                }, error => {
                    console.log('err', error);
                    micLoaded = false;
                    this.screenMicLoaded = true;
                });
            });


        }

        s.draw = () => {

            this.ngZone.runOutsideAngular(() => {
                //function touchStarted() {
                // if (s.getAudioContext().state !== 'running') {

                // }
                //var synth = new p5.MonoSynth();
                //synth.play('A4', 0.5, 0, 0.2);
                //}
                //console.log(s.getAudioContext().state);
                if (s.getAudioContext().state !== 'running') {
                    s.text('click to start audio', s.width / 2, s.height / 2);
                    s.getAudioContext().resume();
                }
                else if (micLoaded) {

                    //console.log('micLoaded');

                    s.background('#111111');
                    this.level = amplitude.getLevel();
                    //console.log('level', this.level);
                    this.analyzer.analyser.getByteFrequencyData(this.analyzer.freqDomain);
                    this.analyzer.analyser.getByteTimeDomainData(timeByteData);
                    this.beatChange = false;
                    this.sceneChange = false;

                    //normalize levelsData from freqByteData
                    for (let i = 0; i < this.levelsCount; i++) {
                        let sum = 0;
                        for (let j = 0; j < levelBins; j++) {
                            sum += this.analyzer.freqDomain[i * levelBins + j];
                        }
                        this.levelsData[i] = sum / levelBins / 256 * 1; //freqData maxs at 256

                        //adjust for the fact that lower levels are percieved more quietly
                        //make lower levels smaller
                        //levelsData[i] *=  1 + (i/levelsCount)/2; //??????
                    }

                    //GET AVG LEVEL
                    let sum = 0;
                    for (let j = 0; j < this.levelsCount; j++) {
                        sum += this.levelsData[j];
                    }

                    this.volume = sum / this.levelsCount;

                    //console.log('freqByteData', this.analyzer.freqDomain);
                    //console.log('LEVELS', this.levelsData);
                    //console.log(this.level, this.volume);

                    // On Beat
                    //if (this.level > beatCutoff && this.level > beatThreshold && framesSinceLastBeat >= beatHoldFrames) {
                    if (this.volume > beatCutoff && this.volume > this.beatMin) {

                        // Beat Change true
                        this.beatChange = true;
                        this.beatFx = true;
                        setTimeout(() => {
                            this.beatFx = false;
                        }, 300);

                        // Lets do something with the effects here
                        if (this.track.modules[this.currentModule] &&
                            this.track.modules[this.currentModule].settings.imageDatGui &&
                            this.track.modules[this.currentModule].settings.imageDatGui[26].on
                        ) {
                            //console.log('FX BEAT');
                            let fxGui = this.track.modules[this.currentModule].settings.imageDatGui[26];

                            // Randomize onBeat
                            // if (fxGui.properties[1].value) {
                            //     this.randomize();
                            // }
                        }

                        //ellipseWidth = 50;
                        //ellipseWidth = 64 - (((this.level * 100) * 64) / 100);

                        //console.log('ellipseWidth', ellipseWidth);

                        //beatCutoff = this.level * 1.2;

                        //beatCutoff = this.level * 1.1;
                        beatCutoff = this.volume * 1.1;
                        ellipseWidth = 64 - (((beatCutoff * 100) * 64) / 100);

                        framesSinceLastBeat = 0;
                        this.onBeat();
                        beatTime = 0;

                        // On Tap Functionality
                        if (this.count > 1) {
                            this.count = 0;
                        }

                        let timeSeconds = new Date();
                        let msecs = timeSeconds.getTime();

                        if (msecs - this.msecsPrevious > 2000) {
                            this.count = 0;
                        }

                        if (this.count === 0) {
                            this.msecsFirst = msecs;
                            this.count = 1;
                        } else {
                            let bpmAvg = 60000 * this.count / (msecs - this.msecsFirst);
                            this.msecsAvg = (msecs - this.msecsFirst) / this.count;
                            this.count++;
                            let newBpm = Math.round(bpmAvg * 100) / 100;
                            if (newBpm < 300) {
                                this.bpm = newBpm;
                                this.onBPMBeat();
                                clearInterval(this.timer);
                                this.timer = setInterval(this.onBPMBeat, this.msecsAvg);
                            }
                        }
                        this.msecsPrevious = msecs;

                        // Handle time signature beat and measure
                        switch (this.track.settings.changeOn) {
                            case 'Beat':
                                this.sceneChange = true;
                                break;

                            case 'Beatx2':
                                if (this.track.settings.timeSignature == '4/4') {
                                    if (this.beat & 1) {
                                        // ODD
                                        this.sceneChange = false;
                                    }
                                    else {
                                        // EVEN
                                        this.sceneChange = true;
                                    }
                                }
                                break;

                            case 'Measure/Beatx4':
                                if (this.track.settings.timeSignature == '4/4') {
                                    if (this.beat == 1) {
                                        this.sceneChange = true;
                                    }
                                }
                                break;

                            case 'Measurex2/Beatx8':
                                if (this.track.settings.timeSignature == '4/4') {
                                    if (this.beat == 1 && this.measure == 2) {
                                        this.sceneChange = true;
                                    }
                                }
                                break;
                        }

                        // Handle scene change
                        if (this.sceneChange && this.playing) {
                            // change the current main module
                            if (this.currentModule < this.track.modules.length - 1) {
                                this.currentModule++;
                            } else {
                                this.currentModule = 0;
                            }

                            this.editModule(false, this.currentModule);
                        }

                        // Beat and measure
                        if (this.track.settings.timeSignature = '4/4') {
                            if (this.beat == 4) {
                                this.beat = 1;
                                if (this.measure == 2) {
                                    this.measure = 1;
                                } else {
                                    this.measure = 2;
                                }
                            } else {
                                this.beat++;
                            }
                        } else if (this.track.settings.timeSignature == '3/4') {
                            if (this.beat == 3) {
                                this.beat = 1;
                                if (this.measure == 2) {
                                    this.measure = 1;
                                } else {
                                    this.measure = 2;
                                }
                            } else {
                                this.beat++;
                            }
                        }

                    }

                    else {
                        // if (framesSinceLastBeat <= beatHoldFrames) {
                        //     framesSinceLastBeat++;
                        // }
                        // else {
                        //     beatCutoff *= this.beatDecayRate;
                        //     beatCutoff = Math.max(beatCutoff, beatThreshold);
                        //     ellipseWidth *= this.beatDecayRate;
                        // }

                        if (beatTime <= beatHoldFrames) {
                            beatTime++;
                        } else {
                            beatCutoff *= this.beatDecayRate;
                            beatCutoff = Math.max(beatCutoff, this.beatMin);
                        }
                        ellipseWidth *= this.beatDecayRate;

                        //beatCutoff *= this.beatDecayRate;
                        //beatCutoff = Math.max(beatCutoff, beatThreshold);
                        //ellipseWidth *= this.beatDecayRate;
                    }

                    // Set BPM Time
                    this.bpmTime = (new Date().getTime() - this.bpmStart) / this.msecsAvg;

                    //if (!this.fullscreen) {

                    // Kill fill and stroke
                    s.noStroke();
                    s.noFill();

                    // Draw BPM Rectangle
                    // let size = 64 - this.bpmTime * 64;
                    // s.fill('#555555');
                    // s.noStroke();
                    // s.rect(s.width - size, s.height - size, size, size);
                    // s.noFill();

                    // Beat Bar
                    //if (ellipseWidth > 3) {
                    //s.ellipse(s.width / 2, s.height / 2, ellipseWidth, ellipseWidth);
                    //s.stroke('#ff4081');
                    s.noStroke();
                    s.fill('#ff4081');
                    s.rect(0, s.height - ellipseWidth, s.width, ellipseWidth);
                    //}

                    // Level Line
                    s.stroke('#CCCCCC');
                    let levelLine = 64 - (((this.volume * 100) * 64) / 100);
                    s.line(0, levelLine, s.width, levelLine);

                    // Cutoff
                    s.stroke('#ffffff');
                    let cutoffLine = 64 - (((beatCutoff * 100) * 64) / 100);
                    s.line(0, cutoffLine, s.width, cutoffLine);

                    // Cute waveform
                    this.spectrum = fft.analyze();
                    s.noFill();
                    s.stroke('#ffffff');
                    s.beginShape();
                    for (let i = 0; i < this.spectrum.length; i++) {
                        s.vertex(i, s.map(this.spectrum[i], 0, 255, s.height, 0));
                    }
                    s.endShape();

                    s.noStroke();
                    s.noFill();

                    // Draw BPM Rectangle
                    // let size = 64 - this.bpmTime * 64;
                    // s.fill('#555555');
                    // s.noStroke();
                    // s.rect(s.width - size, s.height - size, size, size);
                    // s.noFill();

                    // BPM Text
                    s.fill('#ff4081');
                    s.textSize(11);
                    s.text('~BPM: ' + this.bpm, 70, 13);

                    // Volume Level Text
                    s.fill('#ff4081');
                    s.text('VOL: ' + (Math.round(this.volume * 100) / 100), 146, 13);
                    s.noFill();

                    //}
                }
            });
        }
    }

    apiGetBlockImage(file, i = this.currentModule): any {
        return new Promise((resolve, reject) => {

            // Local File, must upload to cloud
            if (!(file.includes("http"))) {

                // first upload the original gif file to the cloud
                this.getSignedRequest(file, false, i, 'fileObject').then(res => {

                    let filePath = 'https://visualz-1.s3.us-east-2.amazonaws.com/cloud-sets/' + this.roomName + '/' + this.roomName.replace(/ /g, '-').toLowerCase() + '/' + res.name;
                    let data = {
                        'file-name': filePath,
                        'set-name': this.roomName.replace(/ /g, '-').toLowerCase(),
                        'mid': this.roomName,
                        'bucket': 'visualz-1',
                        'offset': 1000
                    };
                    //this.tracks[this.currentTrack].modules[i].settings.file = filePath;
                    this.apiExtractFrame(data).then((res) => {
                        console.log('ZED', res);
                        this.track.modules[i].settings.blockImage = res.fileName;
                        resolve(res);
                    }, (err) => {
                        console.log('ERR', err);
                        reject(err);
                    });

                }, err => {
                    console.log('Could not sign file.');
                    reject(err);
                    return false;
                });
            }
            // Already Remote
            else {

                let filePath = file;
                let data = {
                    'file-name': filePath,
                    'set-name': this.roomName.replace(/ /g, '-').toLowerCase(),
                    'mid': this.roomName,
                    'bucket': 'visualz-1',
                    'offset': 1000
                };

                this.apiExtractFrame(data).then((res) => {
                    console.log('ZED', res);
                    this.track.modules[i].settings.blockImage = res.fileName;
                    resolve(res);
                }, (err) => {
                    console.log('ERR', err);
                    reject(err);
                });
            }
        });
    }

    apiExtractFrame(data): any {
        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.apiUrl + '/api/extractFrame', true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        console.log('XRAY', response.fileName);
                        resolve(response);
                        return false;
                    }
                    else {
                        console.log('Could not convert.');
                        reject();
                        return false;
                    }
                }
            }
            xhr.send(JSON.stringify(data));
        });
    }

    onBeat = () => {
        this.gotBeat = true;
    }

    onBPMBeat = () => {
        this.bpmStart = new Date().getTime();
        this.gotBeat = false;
    }

    // file is fileObject @MOVE
    // i is track index
    // j is module index
    // key is the module settings object key for property that holds the file value
    getSignedRequest(file, i, j, key): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.apiUrl + `/api/sign-s3-visualz/?file-name=${file.name}&file-type=${file.type}&set-name=${this.roomName.replace(/ /g, '-').toLowerCase()}&mid=${this.roomName}`);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        this.uploadFile(file, response.signedRequest, response.url).then((res) => {
                            resolve({ res: res, i: i, j: j, key: key, name: file.name });
                        });
                    }
                    else {
                        reject('Could not get signed URL');
                    }
                }
            };
            xhr.send();
        });
    }

    // @MOVE
    uploadFile(file, signedRequest, url): any {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', signedRequest);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve('Uploaded');
                    }
                    else {
                        reject('Could not upload file.');
                    }
                }
            };
            xhr.send(file);
        });
    }

    getGif(tag): any {
        let promise = new Promise((resolve, reject) => {
            let res = { data: {} };
            this.httpClient.get('http://api.giphy.com/v1/gifs/random?api_key=CW27AW0nlp5u0&tag=' + tag).subscribe((res) => {
                if (res) {
                    //console.log(res.data.images.original.url);
                    //this.mixpanelService.track('Giphy Api Request');
                    resolve(res);
                }
            });
        });
        return promise;
    }

    //
    // Media Module Three.js
    // Gifs, and all video formats are converted to mp4 so they all
    // use this video module on the three.js side.
    //
    playMediaModuleThree(): any {
        //this.statsUpdate();
        let uuid = this.track.modules[this.currentModule].uuid;
        let fileType = this.track.modules[this.currentModule].settings.fileType;
        let loaded = this.threeMedia[uuid].loaded;

        // Setup Scene
        if (this.lastModule !== this.currentModule) {
            console.log('SETUP playMediaModuleThree', this.track.modules[this.currentModule], this.threeMedia[uuid]);
            // Clear Scene and Hide the Camera's View
            this.scene.remove.apply(this.scene, this.scene.children);
            this.camera.position.z = 0;
            // Add the Webcam back
            this.addWebcamBox();

            // Add the Mesh
            if (this.threeMedia[uuid] && this.threeMedia[uuid].mesh) {
                this.scene.add(this.threeMedia[uuid].mesh);
                //this.imageEffectsThreeSetup(uuid);
            }

            // Lastly Set the Camera's View
            this.camera = this.oCamera;
            this.camera.position.z = this.screenW; //* (this.screenW / this.screenH); //this.screenH - (this.screenH * .2);
            this.camera.position.y = 0;
            this.camera.updateProjectionMatrix();

            // Update this, it is used for loading purposes
            if (fileType !== 'mp4' && loaded) {
                this.lastModule = this.currentModule;
            } else if (fileType == 'mp4') {
                this.lastModule = this.currentModule;
            }
        }

        if (fileType !== 'mp4' && loaded) {
            this.sketchLoading = false;
        } else if (fileType == 'mp4') {
            this.sketchLoading = false;
        }

        //if (this.threeMedia[uuid] && this.threeMedia[uuid].texture) {
        this.imageEffectsThree(uuid);

        // Update the texture for Mp4
        //if (fileType == 'mp4') {
        this.threeMedia[uuid].texture.needsUpdate = true;
        //}
        //}


    }

    imageEffectsThree(uuid): any {
        //if (audioReactive) {
        // let gotoScale = (this.volume * 1.2 + .1) * 2;
        // this.scl += (gotoScale - this.scl) / 3;
        // this.videoSize = this.screenH / 2 * this.scl;
        // this.__cube.scale.x = this.__cube.scale.y = this.__cube.scale.z = this.videoSize;

        //}
    }

}
