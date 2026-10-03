# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: station-arrival.spec.mjs >> the ride docks, pans right, opens the book, then visits station 02 at 390x844
- Location: tests\browser\station-arrival.spec.mjs:7:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.nx-world')
Expected: "panning"
Received: "book"
Timeout:  50000ms

Call log:
  - Expect "toHaveAttribute" locator('.nx-world') with timeout 50000ms
  - waiting for locator('.nx-world')
    2 × locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="1" data-speed="0.00" data-fov="105.00" data-boost="false" data-orbit="false" data-phase="riding" data-distance="0.00" data-card-station="" data-draw-calls="104" data-dilation="1.000" data-travel-target="" data-antialias="true" data-triangles="26959" data-pixel-ratio="1.00" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0000" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
      - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="0.23" data-fov="105.01" data-boost="false" data-orbit="false" data-phase="riding" data-distance="0.01" data-draw-calls="103" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="26958" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0003" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="0.52" data-fov="105.04" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="94" data-distance="0.03" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="24078" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0004" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="2.33" data-fov="105.26" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="93" data-distance="0.32" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="24066" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0021" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="6.67" data-fov="106.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="91" data-distance="2.27" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23982" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0022" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="106.79" data-speed="11.09" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="88" data-distance="6.11" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22128" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0042" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="107.84" data-speed="17.24" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="87" data-distance="15.63" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22272" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0110" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="108.47" data-speed="20.75" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="76" data-distance="24.51" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22366" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0069" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="108.94" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="75" data-distance="34.11" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22534" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0132" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="70" data-distance="47.14" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21946" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0121" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="69" data-distance="57.49" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="20770" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0205" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="58" data-distance="72.44" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23960" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0102" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="66" data-distance="82.79" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22462" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0263" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.19" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="67" data-distance="92.75" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23612" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0040" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.15" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="46" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="24402" data-distance="108.47" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0141" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.01" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="48" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22752" data-distance="118.44" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0262" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="44" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21968" data-distance="128.79" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0068" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="30" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18438" data-distance="143.74" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0506" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="109.13" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="24" data-triangles="7666" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="153.70" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0429" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="108.88" data-speed="21.71" data-boost="false" data-orbit="false" data-draw-calls="29" data-phase="braking" data-triangles="7510" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="168.50" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0293" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="108.47" data-speed="19.32" data-boost="false" data-orbit="false" data-draw-calls="24" data-phase="braking" data-triangles="7054" data-dilation="0.998" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="177.39" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0491" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="107.90" data-speed="16.95" data-boost="false" data-orbit="false" data-draw-calls="46" data-phase="braking" data-dilation="0.972" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="17760" data-distance="185.15" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0297" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-f…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="106.84" data-speed="13.67" data-boost="false" data-orbit="false" data-draw-calls="49" data-phase="braking" data-dilation="0.900" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18396" data-distance="194.22" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0062" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-f…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="105.84" data-speed="11.68" data-boost="false" data-orbit="false" data-draw-calls="49" data-phase="braking" data-dilation="0.779" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18396" data-distance="198.90" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0054" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-f…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="9.95" data-fov="104.33" data-boost="false" data-orbit="false" data-draw-calls="59" data-phase="braking" data-dilation="0.592" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18612" data-distance="202.20" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0072" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="8.08" data-fov="102.76" data-boost="false" data-orbit="false" data-draw-calls="70" data-phase="braking" data-dilation="0.404" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="19298" data-distance="205.17" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0025" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="7.19" data-fov="102.23" data-boost="false" data-orbit="false" data-draw-calls="72" data-phase="braking" data-dilation="0.339" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="19300" data-distance="206.39" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0018" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="6.42" data-fov="101.89" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.298" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="20500" data-distance="207.32" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0012" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="5.39" data-fov="101.59" data-boost="false" data-orbit="false" data-draw-calls="82" data-phase="braking" data-dilation="0.261" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23268" data-distance="208.41" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0008" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="4.80" data-fov="101.46" data-boost="false" data-orbit="false" data-draw-calls="84" data-phase="braking" data-dilation="0.246" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23280" data-distance="208.96" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0005" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="3.92" data-fov="101.34" data-boost="false" data-orbit="false" data-draw-calls="84" data-phase="braking" data-dilation="0.233" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23280" data-distance="209.64" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0004" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="3.36" data-fov="101.28" data-boost="false" data-orbit="false" data-draw-calls="84" data-phase="braking" data-dilation="0.227" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23280" data-distance="210.00" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0003" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="2.55" data-fov="101.22" data-boost="false" data-orbit="false" data-draw-calls="85" data-phase="braking" data-dilation="0.223" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22664" data-distance="210.43" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0002" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="1.99" data-fov="101.19" data-boost="false" data-orbit="false" data-draw-calls="85" data-phase="braking" data-dilation="0.221" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22664" data-distance="210.66" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0002" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="1.18" data-fov="101.15" data-boost="false" data-orbit="false" data-draw-calls="85" data-phase="braking" data-dilation="0.220" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22664" data-distance="210.88" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="0.63" data-fov="101.13" data-boost="false" data-orbit="false" data-draw-calls="85" data-phase="braking" data-dilation="0.220" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22664" data-distance="210.97" data-pixel-ratio="0.75" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    63 × locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-speed="0.00" data-fov="101.10" data-boost="false" data-orbit="false" data-draw-calls="81" data-phase="stopped" data-card-station="" data-dilation="0.220" data-travel-target="" data-antialias="true" data-triangles="22572" data-distance="211.00" data-pixel-ratio="0.75" data-pan-angle="-1.5708" data-drive-ready="false" data-pan="0.0,50.0,35.0" data-camera-lag="1.5707" data-audio-gain="0.0000" data-arrival-stage="book" data-pan-progr…>…</div>
       - unexpected value "book"

```

```yaml
- group "Nucleus roller coaster. W or D to accelerate, S or A to brake and reverse. Hold Shift to boost. Drag to look. E opens a nearby station."
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFile } from 'node:fs/promises';
  3  | 
  4  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5  | 
  6  | for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  7  |   test(`the ride docks, pans right, opens the book, then visits station 02 at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
  8  |     test.setTimeout(120_000);
  9  |     const errors = [];
  10 |     page.on('pageerror', error => errors.push(error.message));
  11 |     await page.setViewportSize(viewport);
  12 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  13 |     await page.goto('/events');
  14 |     await page.getByRole('button', { name: 'Ride Immersive Experience', exact: true }).first().click();
  15 |     await page.getByRole('button', { name: "Yes, Let's Go" }).click();
  16 |     await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  17 |     await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
  18 |     if (await page.getByRole('button', { name: 'Return to ride' }).isVisible()) await page.getByRole('button', { name: 'Return to ride' }).click();
  19 |     const world = page.locator('.nx-world'), book = page.locator('.station-book');
  20 |     await world.focus(); await page.keyboard.down('w');
> 21 |     await expect(world).toHaveAttribute('data-arrival-stage', 'panning', { timeout: 50_000 });
     |                         ^ Error: expect(locator).toHaveAttribute(expected) failed
  22 |     await page.keyboard.up('w');
  23 |     await expect(world).toHaveAttribute('data-phase', 'stopped');
  24 |     await expect(world).toHaveAttribute('data-distance', '211.00');
  25 |     await expect(book).toHaveCount(0);
  26 |     await expect(world).toHaveAttribute('data-drive-ready', 'false');
  27 |     await expect(book).toBeVisible();
  28 |     await expect(book).toHaveAttribute('data-station-number', '01');
  29 |     await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
  30 |     await expect(world).toHaveAttribute('data-distance', '211.00');
  31 |     await page.screenshot({ path: info.outputPath('docked-inauguration-book.png') });
  32 |     await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
  33 |     await world.focus(); await page.keyboard.down('w');
  34 |     await expect(world).toHaveAttribute('data-arrival-stage', 'panning', { timeout: 40_000 });
  35 |     await page.keyboard.up('w');
  36 |     await expect(world).toHaveAttribute('data-distance', '343.00');
  37 |     await expect(book).toHaveAttribute('data-station-number', '02');
  38 |     await expect(page.getByRole('dialog', { name: 'Dev', exact: true })).toBeVisible();
  39 |     await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
  40 |     expect(errors).toEqual([]);
  41 |   });
  42 | }
  43 | 
```