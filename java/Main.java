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

	public static void main(String[] args){
		
		System.out.println("Started.");
		
		try{

			File file = new File("input.png");
			BufferedImage image = ImageIO.read(file);
			BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);

			int width = image.getWidth();
			int height = image.getHeight();
			int half = average(width, 0);
			int start = 0;
			Kernel kernel = new Main.Kernel(5, 0.66);
			for(int x = 0; x < half; x++){
				for(int y = 0; y < height; y++){
					image.setRGB(x+half, y, image.getRGB(x, y));
					int pixels = 0;
					int rSum = 0;
					int gSum = 0;
					int bSum = 0;
					for(int xt = -1 * kernel.getSize(); xt < kernel.getSize(); xt++){
						for(int yt = -1 * kernel.getSize(); yt < kernel.getSize(); yt++){
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
					Color nc = new Color(rSum/pixels, gSum/pixels, bSum/pixels);
					image.setRGB(x, y, nc.getRGB());
				}
				if(x%100==0){
					System.out.println(x);
				}
			}

			ImageIO.write(image, "png", new File("output.png"));

		}
		catch(Exception e){
			e.printStackTrace();
		}

		System.out.println("Done.");

	}

}