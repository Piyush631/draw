export function Video() {
  return (
    <div id="video" className="lg:px-48 md:px-28 px-11  mx-auto">
      <video
        className="h-full w-full object-contain  rounded-2xl shadow-2xl shadow-gray-500 "
        autoPlay
        loop
        muted
        playsInline
        src="./sample.mp4"
      ></video>
    </div>
  );
}
