import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import java.awt.Color;

public class Main {

	public static double gaussian(int x, int y, double sd){
		double stdev = sd;//0.66;
		double denom = Math.sqrt(2 * Math.PI * Math.pow(stdev, 2));
		double exp = (Math.pow(x, 2) + Math.pow(y, 2)) / (2 * Math.pow(stdev, 2));
		return Math.pow(denom, -1) * Math.pow(Math.E, (-1 * exp));
	}

	public static class Kernel {

		private double stdev;
		private int size;

		public Kernel(int size, double stdev){
			this.size = size;
			this.stdev = stdev;
		}

		public int getSize(){
			return this.size;
		}

		public double getWeight(int x, int y){
			return gaussian(x, y, this.stdev);
		}

	}

	public static void printColor(Color c){
		System.out.println("(" + c.getRed() + ", " + c.getGreen() + ", " + c.getBlue() + ")");
	}

	public static int average(double a, double b){
		return (int)((a + b) / 2);
	}

	public static int normalizeColor(int c){
		if(c < 0){
			return 0;
		}
		else if(c > 255){
			return 255;
		}
		else{
			return c;
		}
	}

	public static BufferedImage getImageComparison(BufferedImage left, BufferedImage right){
		int width = left.getWidth() + right.getWidth();
		int height = left.getHeight() > right.getHeight() ? left.getHeight() : right.getHeight();
		BufferedImage result = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
		for(int xl = 0; xl < left.getWidth(); xl++){
			for(int yl = 0; yl < left.getHeight(); yl++){
				result.setRGB(xl, yl, left.getRGB(xl, yl));
			}
		}
		for(int xr = 0; xr < right.getWidth(); xr++){
			for(int yr = 0; yr < right.getHeight(); yr++){
				result.setRGB(left.getWidth() + xr, yr, right.getRGB(xr, yr));
			}
		}
		return result;
	}

	public static BufferedImage applyGaussianBlur(BufferedImage image, Kernel kernel){
		BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);
		int width = image.getWidth();
		int height = image.getHeight();
		int start = 0;
		for(int x = 0; x < width; x++){
			for(int y = 0; y < height; y++){
				int pixels = 0;
				int rSum = 0;
				int gSum = 0;
				int bSum = 0;
				int halfSize = (int)(kernel.getSize() / 2);
				for(int xt = -1 * halfSize; xt < halfSize; xt++){
					for(int yt = -1 * halfSize; yt < halfSize; yt++){
						try{
							int xp = x + xt;
							int yp = y + yt;
							int rgb = image.getRGB(xp, yp);
							double weight = 1.0 + kernel.getWeight(xt, yt);
							Color c = new Color(rgb);
							rSum += (c.getRed() * weight);
							gSum += (c.getGreen() * weight);
							bSum += (c.getBlue() * weight);
							pixels++;
						}
						catch(Exception ex){
							// Coordinate out of Bounds
						}
					}
				}
				Color nc = new Color(
					normalizeColor(rSum/pixels), 
					normalizeColor(gSum/pixels), 
					normalizeColor(bSum/pixels)
				);
				result.setRGB(x, y, nc.getRGB());
			}
			if(x%100==0){
				System.out.println(x);
			}
		}
		return result;
	}

	public static void main(String[] args){
		
		System.out.println("Started.");
		
		try{

			File file = new File("edge-input.png");
			BufferedImage image = ImageIO.read(file);
			Kernel kernel = new Main.Kernel(10, 0.66);
			BufferedImage result = Main.applyGaussianBlur(image, kernel);
			BufferedImage comparison = getImageComparison(result, image);
			ImageIO.write(comparison, "png", new File("edge-output.png"));

		}
		catch(Exception e){
			e.printStackTrace();
		}

		System.out.println("Done.");

	}

}