# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: station-arrival.spec.mjs >> the ride docks, pans right, opens the book, then visits station 02 at 1440x900
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
    2 × locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="45.39" data-speed="0.00" data-boost="false" data-orbit="false" data-phase="riding" data-distance="0.00" data-card-station="" data-draw-calls="153" data-dilation="1.000" data-travel-target="" data-antialias="true" data-triangles="17856" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="false" data-pan="0.0,50.0,35.0" data-camera-lag="0.4492" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
      - unexpected value "riding"
    2 × locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="53.76" data-speed="0.00" data-boost="false" data-orbit="false" data-phase="riding" data-distance="0.00" data-card-station="" data-draw-calls="149" data-dilation="1.000" data-travel-target="" data-antialias="true" data-triangles="17668" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="false" data-pan="0.0,50.0,35.0" data-camera-lag="0.2829" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
      - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.08" data-speed="0.00" data-boost="false" data-orbit="false" data-phase="riding" data-distance="0.00" data-card-station="" data-draw-calls="107" data-dilation="1.000" data-travel-target="" data-antialias="true" data-triangles="18662" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="false" data-pan="0.0,50.0,35.0" data-camera-lag="0.0779" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="68.02" data-speed="0.23" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="96" data-distance="0.01" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22410" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0005" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus=…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="68.48" data-speed="2.67" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="93" data-distance="0.41" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="24282" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0017" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus=…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="69.52" data-speed="6.69" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="86" data-distance="2.28" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22510" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0017" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus=…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="70.61" data-speed="10.77" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="86" data-distance="5.77" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22500" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0042" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focus…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="71.58" data-speed="14.67" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="91" data-distance="10.87" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22668" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0126" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="72.90" data-speed="19.57" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="89" data-distance="21.20" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22644" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0046" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="73.65" data-speed="22.35" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="85" data-distance="29.59" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22188" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0050" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="73.99" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="69" data-distance="40.68" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21682" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0066" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="62" data-distance="56.39" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="20348" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0174" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="64" data-distance="67.11" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="20504" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0060" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="69" data-distance="77.85" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22630" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0137" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.29" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="70" data-distance="92.79" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23722" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0036" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.20" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="69" data-distance="97.39" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="24202" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0071" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.27" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="64" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="25196" data-distance="105.44" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0091" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.15" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="49" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23868" data-distance="110.04" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0103" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.03" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="39" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="23386" data-distance="114.64" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0167" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="45" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22666" data-distance="121.54" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0084" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="44" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22666" data-distance="126.14" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0049" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="42" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22666" data-distance="130.74" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0041" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="40" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="22510" data-distance="135.34" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0051" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="30" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21202" data-distance="142.24" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0154" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.00" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="23" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="16606" data-distance="145.69" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0484" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.23" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="26" data-triangles="7726" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="152.59" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0080" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.31" data-speed="23.00" data-boost="false" data-orbit="false" data-phase="riding" data-draw-calls="22" data-triangles="7306" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="157.19" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0121" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-focu…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="74.02" data-speed="22.72" data-boost="false" data-orbit="false" data-draw-calls="25" data-phase="braking" data-triangles="7594" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-distance="165.23" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0392" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="73.77" data-speed="21.60" data-boost="false" data-orbit="false" data-draw-calls="29" data-phase="braking" data-dilation="1.000" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="17734" data-distance="169.66" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0130" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="72.96" data-speed="18.54" data-boost="false" data-orbit="false" data-draw-calls="38" data-phase="braking" data-dilation="0.993" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="17304" data-distance="180.36" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.1180" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="72.00" data-speed="16.06" data-boost="false" data-orbit="false" data-draw-calls="52" data-phase="braking" data-dilation="0.953" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="17786" data-distance="188.24" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0086" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="71.04" data-speed="13.90" data-boost="false" data-orbit="false" data-draw-calls="48" data-phase="braking" data-dilation="0.904" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="17844" data-distance="194.02" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0061" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="69.03" data-speed="11.02" data-boost="false" data-orbit="false" data-draw-calls="57" data-phase="braking" data-dilation="0.710" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18074" data-distance="200.34" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0056" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-fo…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="67.33" data-speed="9.45" data-boost="false" data-orbit="false" data-draw-calls="58" data-phase="braking" data-dilation="0.535" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18146" data-distance="203.14" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0037" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="66.19" data-speed="8.24" data-boost="false" data-orbit="false" data-draw-calls="60" data-phase="braking" data-dilation="0.417" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="18170" data-distance="204.99" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0019" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="65.34" data-speed="7.00" data-boost="false" data-orbit="false" data-draw-calls="70" data-phase="braking" data-dilation="0.328" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="19022" data-distance="206.66" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0011" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="65.00" data-speed="6.28" data-boost="false" data-orbit="false" data-draw-calls="74" data-phase="braking" data-dilation="0.292" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="19672" data-distance="207.51" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0008" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.67" data-speed="5.24" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.256" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21604" data-distance="208.57" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0005" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.52" data-speed="4.55" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.242" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21604" data-distance="209.18" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0004" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.42" data-speed="3.95" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.233" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21604" data-distance="209.63" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0003" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.35" data-speed="3.37" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.227" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21604" data-distance="210.01" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0002" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.27" data-speed="2.55" data-boost="false" data-orbit="false" data-draw-calls="78" data-phase="braking" data-dilation="0.223" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21748" data-distance="210.44" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0002" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.23" data-speed="2.05" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.221" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21108" data-distance="210.64" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.20" data-speed="1.54" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.221" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21108" data-distance="210.80" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.17" data-speed="1.10" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.220" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21108" data-distance="210.90" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.16" data-speed="0.91" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.220" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21108" data-distance="210.94" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0001" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    - locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.13" data-speed="0.44" data-boost="false" data-orbit="false" data-draw-calls="77" data-phase="braking" data-dilation="0.220" data-card-station="0" data-travel-target="" data-antialias="true" data-triangles="21108" data-distance="210.99" data-pixel-ratio="0.73" data-pan-angle="0.0000" data-drive-ready="true" data-pan="0.0,50.0,35.0" data-camera-lag="0.0000" data-audio-gain="0.0000" data-pan-progress="0.000" data-station-foc…>…</div>
    - unexpected value "riding"
    45 × locator resolved to <div tabindex="0" role="group" class="nx-world" data-quality="0" data-fov="64.10" data-speed="0.00" data-boost="false" data-orbit="false" data-draw-calls="71" data-phase="stopped" data-card-station="" data-dilation="0.220" data-travel-target="" data-antialias="true" data-triangles="21444" data-distance="211.00" data-pixel-ratio="0.73" data-pan-angle="-1.5708" data-drive-ready="false" data-pan="0.0,50.0,35.0" data-camera-lag="1.5708" data-audio-gain="0.0000" data-arrival-stage="book" data-pan-progre…>…</div>
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