type Props = {
  imageURL: string;
};

function Avatar({ imageURL }: Props) {
  return (
    <>
      <img
        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
        src={imageURL}
        alt=""
      />
    </>
  );
}

export default Avatar;
